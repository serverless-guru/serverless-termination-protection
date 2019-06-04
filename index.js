'use strict';

const AWS = require('aws-sdk');

const getCloudformation = serverless => {
  let profile = serverless.service.provider.profile || "default";
  let credentials = new AWS.SharedIniFileCredentials({ profile: profile });

  AWS.config.update({
    region: serverless.service.provider.region,
    apiVersions: {
      cloudformation: '2010-05-15',
    },
    credentials: credentials
  });

  return new AWS.CloudFormation();
};

const addTerminationProtection = (serverless, options) => new Promise((resolve, reject) => {
  const cf = getCloudformation(serverless);
  let serviceStage = serverless.service.provider.stage;
  let stackName = `${serverless.service.service}-${serviceStage}`;
  let params = {
    EnableTerminationProtection: true,
    StackName: stackName
  };
  serverless.cli.log(`STP: Adding termination protection to ${stackName}..`);
  if(serverless.service.custom.serverlessTerminationProtection) {
    let stp = serverless.service.custom.serverlessTerminationProtection;
    if(stp.stages) {
      if(stp.stages instanceof Array) {
        if(stp.stages.length > 0) {
          serverless.cli.log(`STP: Checking if termination protection should be added..`);
          serverless.cli.log(`STP: Stages to check: ${stp.stages}`);
          let foundStages = stp.stages.filter(stpStage => stpStage === serviceStage );
          if(foundStages.length > 0) {
            let stpStage = foundStages[0];
            serverless.cli.log(`STP: Stage of ${stpStage} found..`);
            handleUpdate(cf, params, serverless)
              .then(() => resolve())
              .catch(error => {
                serverless.cli.log(`Something failed: ${JSON.stringify(error)}`);
                reject(error);
              });
          } else {
            serverless.cli.log(`STP: Not applying termination protection for ${serviceStage} stage`);
          }
        }
      } else {
        serverless.cli.log('STP: The Serverless Termination Protection Plugin uses an array for the stages property');
      }
    } else {
      handleUpdate(cf, params, serverless)
        .then(() => resolve())
        .catch(error => {
          serverless.cli.log(`Something failed: ${JSON.stringify(error)}`);
          reject(error);
        });
    }
  } else {
    handleUpdate(cf, params, serverless)
      .then(() => resolve())
      .catch(error => {
        serverless.cli.log(`Something failed: ${JSON.stringify(error)}`);
        reject(error);
      });
  }
});

const handleUpdate = (cf, params, serverless) => new Promise((resolve, reject) => {
  cf.updateTerminationProtection(params, (error, result) => {
    if (error) {
      return reject(error);
    }
    serverless.cli.log('STP: Attached termination protection');
    return resolve();
  });
});

class ServerlessTerminationProtectionPlugin {
  constructor(serverless, options) {
    this.hooks = {
      'after:deploy:finalize': addTerminationProtection.bind(null, serverless, options)
    };
  }
}

module.exports = ServerlessTerminationProtectionPlugin;
