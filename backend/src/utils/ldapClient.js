const { Client } = require('ldapts');
const config = require('../config');
const logger = require('./logger');

const authenticate = async (username, password) => {
  const authConfig = config.auth;
  const ldapConfig = authConfig.ldap;
  
  logger.info('LDAP Authentication attempt', { username });
  logger.debug('LDAP config', { url: ldapConfig.url, adminDn: ldapConfig.adminDn });
  
  let client;
  
  try {
    // Create client
    client = new Client({
      url: ldapConfig.url,
      timeout: 15000,
      connectTimeout: 10000,
      strictDN: true
    });

    // Bind with admin credentials
    await client.bind(ldapConfig.adminDn, ldapConfig.adminPassword);
    logger.info('LDAP Admin bind successful');

    // Search for user
    const searchFilter = ldapConfig.searchFilter.replace('_id', username);
    const { searchEntries } = await client.search(ldapConfig.searchBase, {
      filter: searchFilter,
      scope: 'sub',
      attributes: ldapConfig.objAttributes ? ldapConfig.objAttributes.split(',') : 
                  ['uid', 'displayName', 'mail', 'telephoneNumber', 'mobile', 'physicalDeliveryOfficeName']
    });

    // Close admin client
    await client.unbind();

    if (searchEntries.length === 0) {
      logger.error('User not found in LDAP', { username });
      throw new Error('User not found in LDAP');
    }

    const userDN = searchEntries[0].dn;
    const user = searchEntries[0];
    logger.info('User found in LDAP', { userDN });

    // Verify password
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password: must be a non-empty string');
    }

    // Create new client for user authentication
    const userClient = new Client({
      url: ldapConfig.url,
      timeout: 15000,
      connectTimeout: 10000
    });

    try {
      // Bind with user credentials
      await userClient.bind(userDN, password);
      logger.info('LDAP User bind successful');
      
      // Close user client
      await userClient.unbind();

      return user;
    } catch (bindError) {
      // Ensure user client is closed
      try {
        await userClient.unbind();
      } catch (unbindError) {
        // Ignore unbind error
      }
      throw new Error('LDAP authentication failed: invalid credentials');
    }

  } catch (error) {
    // Ensure client is closed
    if (client) {
      try {
        await client.unbind();
      } catch (unbindError) {
        // Ignore unbind error
      }
    }
    throw error;
  }
};

const searchUser = async (searchTerm) => {
  const authConfig = config.auth;
  const ldapConfig = authConfig.ldap;
  
  const client = new Client({
    url: ldapConfig.url,
    timeout: 15000,
    connectTimeout: 10000
  });

  try {
    // Bind with admin credentials
    await client.bind(ldapConfig.adminDn, ldapConfig.adminPassword);

    const nameFilter = ldapConfig.nameFilter.replace('_name', searchTerm);
    const { searchEntries } = await client.search(ldapConfig.searchBase, {
      filter: nameFilter,
      scope: 'sub',
      attributes: ldapConfig.objAttributes ? ldapConfig.objAttributes.split(',') : 
                  ['uid', 'displayName', 'mail', 'cn']
    });

    const users = searchEntries.map(entry => ({
      username: entry.uid,
      displayName: entry.displayName || entry.cn,
      email: entry.mail,
      telephoneNumber: entry.telephoneNumber,
      mobile: entry.mobile,
      physicalDeliveryOfficeName: entry.physicalDeliveryOfficeName
    }));

    return users;
  } finally {
    // Ensure client is closed
    try {
      await client.unbind();
    } catch (unbindError) {
      // Ignore unbind error
    }
  }
};

module.exports = { authenticate, searchUser };