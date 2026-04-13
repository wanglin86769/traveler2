const { Form } = require('../models/Form');
const { User } = require('../models/User');
const { getUserAccessLevel } = require('../middleware/accessControl');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const submitFormForReview = async (req, res, next) => {
  try {
    const { reviewers = [] } = req.body;
    
    const form = await Form.findById(req.params.id);
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    if (accessLevel < 1) {
      throw new ApiError(403, 'Not authorized to submit this form for review');
    }

    if (form.status !== 0) {
      throw new ApiError(400, 'Form must be in draft status to submit for review');
    }

    if (req.body.version !== undefined && req.body.version !== form._v) {
      throw new ApiError(400, `Form version mismatch. Current version: ${form._v}`);
    }

    form.status = 0.5;
    form.updatedBy = req.user._id;
    form.updatedOn = Date.now();
    form.incrementVersion();

    if (reviewers.length > 0) {
      for (const reviewerId of reviewers) {
        const reviewer = await User.findById(reviewerId);
        if (!reviewer) {
          throw new ApiError(400, `Reviewer with ID ${reviewerId} not found`);
        }
        
        if (!reviewer.roles || !reviewer.roles.includes('reviewer')) {
          throw new ApiError(400, `User ${reviewer.name} does not have reviewer role`);
        }

        await form.requestReview(req.user._id, reviewer);
      }
    }

    await form.saveWithHistory(req.user._id);

    res.json({
      message: 'Form submitted for review',
      id: form._id,
      status: form.status,
      version: form._v,
      reviewers: form.__review?.reviewRequests?.length || 0
    });
  } catch (error) {
    next(error);
  }
};

const getFormReviewInfo = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    if (accessLevel < 1) {
      throw new ApiError(403, 'Not authorized to view review information');
    }

    const review = form.__review || {
      policy: 'all',
      reviewRequests: [],
      reviewResults: []
    };

    const populatedRequests = await Promise.all(
      review.reviewRequests.map(async (request) => {
        const reviewer = await User.findById(request._id).select('_id name email');
        return {
          _id: request._id,
          requestedOn: request.requestedOn,
          requestedBy: request.requestedBy,
          reviewer: reviewer
        };
      })
    );

    const populatedResults = await Promise.all(
      review.reviewResults.map(async (result) => {
        const reviewer = await User.findById(result.reviewerId).select('_id name email');
        return {
          ...result,
          reviewer: reviewer
        };
      })
    );

    res.json({
      ...review,
      reviewRequests: populatedRequests,
      reviewResults: populatedResults
    });
  } catch (error) {
    next(error);
  }
};

const addReviewerToForm = async (req, res, next) => {
  try {
    const { uid, name } = req.body;
    
    if (!uid || !name) {
      throw new ApiError(400, 'Reviewer ID and name are required');
    }

    const form = await Form.findById(req.params.id);
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    if (accessLevel < 1) {
      throw new ApiError(403, 'Not authorized to add reviewers');
    }

    if (form.status !== 0.5) {
      throw new ApiError(400, 'Form must be in review status to add reviewers');
    }

    const reviewer = await User.findById(uid.toLowerCase());
    if (!reviewer) {
      throw new ApiError(400, `Reviewer with ID ${uid} not found`);
    }

    if (!reviewer.roles || !reviewer.roles.includes('reviewer')) {
      throw new ApiError(400, `User ${name} needs to have reviewer role in order to review`);
    }

    await form.requestReview(req.user._id, reviewer);

    res.status(201).json({ message: `Review request added for user ${name}` });
  } catch (error) {
    next(error);
  }
};

const removeReviewerFromForm = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    
    const form = await Form.findById(req.params.id);
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    const accessLevel = await getUserAccessLevel(form, req.user);
    if (accessLevel < 1) {
      throw new ApiError(403, 'Not authorized to remove reviewers');
    }

    if (form.status !== 0.5) {
      throw new ApiError(400, 'Form must be in review status to remove reviewers');
    }

    await form.removeReviewRequest(requestId);

    res.json({ message: `Reviewer ${requestId} removed` });
  } catch (error) {
    next(error);
  }
};

const submitReviewResult = async (req, res, next) => {
  try {
    const { result, comment, v } = req.body;
    
    if (!result || !['1', '2'].includes(result)) {
      throw new ApiError(400, 'Invalid result. Must be "1" (approve) or "2" (rework)');
    }

    const form = await Form.findById(req.params.id);
    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    if (form.status !== 0.5) {
      throw new ApiError(400, 'Form must be in review status to submit review');
    }

    if (!form.__review || !form.__review.reviewRequests) {
      throw new ApiError(403, 'No review requests found');
    }

    const isReviewer = form.__review.reviewRequests.some(
      request => request._id === req.user._id
    );

    if (!isReviewer) {
      throw new ApiError(403, 'Only reviewers can submit review results');
    }

    await form.addReviewResult(req.user._id, result, comment || '', v);

    res.status(201).json({ message: 'Review result submitted' });
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = {
      status: 0.5,
      '__review.reviewRequests._id': req.user._id
    };

    const forms = await Form.find(query)
      .sort({ updatedOn: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get all unique creator IDs
    const creatorIds = [...new Set(forms.map(form => form.createdBy).filter(Boolean))];
    
    // Fetch all creators in one query
    const creators = await User.find(
      { _id: { $in: creatorIds } },
      '_id name'
    ).lean();
    
    const creatorMap = {};
    creators.forEach(creator => {
      creatorMap[creator._id.toString()] = creator;
    });

    const formsWithReview = await Promise.all(
      forms.map(async (form) => {
        const reviewRequests = form.__review?.reviewRequests || [];
        const reviewResults = form.__review?.reviewResults || [];
        const currentUserId = req.user._id.toString();
        
        const myRequest = reviewRequests.find(req => req._id.toString() === currentUserId);
        
        const myLatestResult = reviewResults
          .filter(r => r.reviewerId.toString() === currentUserId)
          .sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))[0];

        return {
          ...form.toObject(),
          createdBy: creatorMap[form.createdBy] || null,
          __review: {
            reviewRequests,
            reviewResults
          },
          myReviewRequest: myRequest,
          myLatestResult
        };
      })
    );

    const total = await Form.countDocuments(query);

    res.json({
      data: formsWithReview,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFormForReview,
  getFormReviewInfo,
  addReviewerToForm,
  removeReviewerFromForm,
  submitReviewResult,
  getMyReviews
};