//** --------- NPM MODULES ---------------- 
const YAML = require('yamljs');

//** --------- NODE APIS ---------------- 
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const fsp = require('fs').promises;
const fs = require('fs');

//** --------- AWS SDK ELEMENTS --------- 
const CloudFormation = require('aws-sdk/clients/cloudformation');
const EC2 = require('aws-sdk/clients/ec2')
// const EKS = require('aws-sdk/clients/eks');
// const IAM = require('aws-sdk/clients/iam');


//** --------- INSTANTIATE AWS CLASSES --- 
const ec2 = new EC2({ region: process.env.REGION });
const cloudformation = new CloudFormation({ region: process.env.REGION });

//const eks = new EKS();
//const sts = new STS();
//const awsConfig = new AWSConfig();
//const iam = new IAM();
//const eks = new EKS({ region: REGION });
//const cloudformation = new CloudFormation({ region: REGION });

//** --------- IMPORT MODULES -----------
const awsHelperFunctions = require(__dirname + '/awsHelperFunctions'); 
const awsParameters = require(__dirname + '/awsParameters');
const awsProps = require(__dirname + '/../awsPropertyNames'); 


//** --------- IMPORT DOCUMENT TEMPLATES - 
const stackTemplateForWorkerNode = require(path.join(__dirname, '/../Storage/AWS_Assets/Policy_Documents/amazon-eks-worker-node-stack-template.json'));

//** --------- DECLARE EXPORT OBJECT ---------------------------------- 
const kubectlConfigFunctions = {};

//**--------- GENERATE AND SAVE CONFIG FILE ON USER COMPUTER ------------- **//
/** 
 * @param {String} clusterName
 */
kubectlConfigFunctions.createConfigFile = async (clusterName) => {

  try {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    console.log('============  kubectlConfigFunctions.createConfigFile ===============')
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
  
    console.log("creating config file");

    //check if .kube folder exists, and if not, make it
    awsHelperFunctions.checkFileSystemForDirectoryAndMkDir(awsProps.KUBE);

    //check for config file
    const configFileExists = fs.existsSync(process.env['HOME'] + `/.kube/config-${clusterName}`);

    if (!configFileExists) {

      console.log("CONFIG FILE DID NOT EXIST")

      //Read Master File and grab data
      const awsMasterFileData = await fsp.readFile(process.env['AWS_STORAGE'] + `AWS_Private/${clusterName}_MASTER_FILE.json`, 'utf-8');
      const parsedAWSMasterFileData = JSON.parse(awsMasterFileData);
      const serverEndpoint = parsedAWSMasterFileData.serverEndPoint;
      const certificateAuthorityData = parsedAWSMasterFileData.certificateAuthorityData;
    
      //Generate parameter with gathered data
      const AWSClusterConfigFileData = awsParameters.createConfigParam(clusterName, serverEndpoint, certificateAuthorityData);
      
      //Format data from the AWSClusterConfigFileData object into YAML to save in user's filesystem 
      let stringifiedAWSClusterConfigFile = JSON.stringify(AWSClusterConfigFileData);
      let parsedAWSClusterConfigFile = JSON.parse(stringifiedAWSClusterConfigFile);
      let yamledAWSClusterConfigFile = YAML.stringify(parsedAWSClusterConfigFile, 6);
      let regexCharToRemove = /(['])+/g;
      let yamledAWSClusterConfigFileWithoutRegex = yamledAWSClusterConfigFile.replace(regexCharToRemove, "");
    
      //Check if user has a .kube folder in root directory, if not, make one
      // const folderName = ".kube";
      // awsHelperFunctions.checkFileSystemForDirectoryAndMkDir(folderName);
    
      //Save file in users .kube directory
      await fsp.writeFile(process.env['HOME']+ `/.kube/config-${clusterName}`, yamledAWSClusterConfigFileWithoutRegex);

      return `The kubeclt config file has been created in the .kube folder in the root directory. Proceeding with the process.`;

    } else {
      console.log("Config file alreadu created");
      return `The kubeclt config file was already created in the .kube folder in the root directory. Proceeding with the process.`;
    }
    
  } catch (err) {
    console.log('There was an error in creating the kubectl config file in .kube folder in root directory: ', err);
    throw(`${err}`);
  }
};

//**--------- CONFIGURE KUBECTL WITH CONFIG FILE -------------------------- **//
/** 
 * @param {String} clusterName
 */
kubectlConfigFunctions.configureKubectl = async (clusterName) => {

  console.log("CONFIGURE KUBECTL WITH CONFIG FILE");

  try {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    console.log('============  kubectlConfigFunctions.configureKubectl ===============')
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    console.log("process.env['KUBECONFIG'] before: ", process.env['KUBECONFIG']);

    process.env['KUBECONFIG'] = `${process.env['HOME']}/.kube/config-${clusterName}`;

    console.log("process.env['KUBECONFIG'] after: ", process.env['KUBECONFIG']);

    let bashRead = await fsp.readFile(process.env['HOME'] + '/.bash_profile', 'utf-8');

    if (bashRead.includes(`export KUBECONFIG`)) {
      if (!bashRead.includes(clusterName)) {
        bashRead = bashRead.replace(/export KUBECONFIG\S*/g, `export KUBECONFIG=$KUBECONFIG:~/.kube/config-${clusterName}`);
        console.log("bashRead: ", bashRead)

        await fsp.writeFile(process.env['HOME'] + '/.bash_profile', bashRead, 'utf-8');

        console.log('re-wrote .bash_profile to set KUBECONFIG env var to the new cluster config file');
      }
    } else {
      const textToAppendToBashProfile = `\nexport KUBECONFIG=$KUBECONFIG:~/.kube/config-${clusterName}`;
      await fsp.appendFile(process.env['HOME'] + '/.bash_profile', textToAppendToBashProfile);
    }


    // if (process.env['KUBECONFIG'] !== undefined) {
    //   console.log("KUBECONFIG is not undefined");

    //   if (!process.env['KUBECONFIG'].includes(clusterName)) {
        
    //     console.log("KUBECONFIG env var exists, but not the same");
    //     process.env['KUBECONFIG'] = `${process.env['HOME']}/.kube/config-${clusterName}`;

    //     console.log("process.env['KUBECONFIG'] after: ", process.env['KUBECONFIG']);

    //     //read the bash profile and replace data in bash profile to reflect accurate location
    //     let bashRead = await fsp.readFile(process.env['HOME'] + '/.bash_profile', 'utf-8')
    //     bashRead = bashRead.replace(/export KUBECONFIG\S*/g, `export KUBECONFIG=$KUBECONFIG:~/.kube/config-${clusterName}`)
    //     console.log("bashRead: ", bashRead)
    //     await fsp.writeFile(process.env['HOME'] + '/.bash_profile', bashRead, 'utf-8');

    //     console.log('re-wrote .bash_profile to set KUBECONFIG env var to the new cluster config file')
    //   } else {
    //     console.log("kubeconfig exists and is the same");
    //   }

    // } else {
    //   console.log("if KUBECONFIG env var doesn't exist");

    //   process.env['KUBECONFIG'] = `${process.env['HOME']}/.kube/config-${clusterName}`;

    //   let textToAppendToBashProfile = `\nexport KUBECONFIG=$KUBECONFIG:~/.kube/config-${clusterName}`;
    //   await fsp.appendFile(process.env['HOME'] + '/.bash_profile', textToAppendToBashProfile);
    // }

  } catch (err) {
    console.log('Error coming from kubectlConfigFunctions.configureKubectl: ', err);
    throw `${err}`;
  }
}


kubectlConfigFunctions.testKubectlGetSvc = (clusterName) => {

  try {

    console.log('this is the current KUBECONFIG at kubectl get svc time:', process.env['KUBECONFIG'])

    const child = spawnSync('kubectl', ['get', 'svc']);
    const stdout = child.stdout.toString();
    const stderr = child.stderr.toString();

    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! kubectl status !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('stdout', stdout, 'stderr', stderr);

    if (!stderr) {
      console.log(`Kubectl has been configured. Here is the service data: ${stdout}`)
      return (`Kubectl has been configured. Here is the service data: ${stdout}`)
    } else {
      throw stderr;
    }

  } catch (err) {
    console.log('Error coming from kubectlConfigFunctions.testKubectlGetSvc: ', err);
    throw `${err}`;
  }

}

//** --------- CREATE A SECOND AWS TECH STACK FOR WORKER NODE ------------ **//
/** 
 * @param {String} iamRoleName
 * @param {String} clusterName
 */

 //TODO: removed iamROleName from params
kubectlConfigFunctions.createStackForWorkerNode = async (clusterName) => {

  let stackStatus;

  try {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    console.log('=========  kubectlConfigFunctions.createStackForWorkerNode ==========')
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    console.log("Creating Worker Node Stack");

    const workerNodeStackName = `${clusterName}-worker-node`;
    console.log("CHECKING WORKER NODE STATUS")

    const isWorkerNodeInMasterFile = await awsHelperFunctions.checkAWSMasterFile(awsProps.WORKER_NODE_STACK_NAME, workerNodeStackName);

    console.log("isWorkerNodeInMasterFile: ", isWorkerNodeInMasterFile);

    if (!isWorkerNodeInMasterFile) {
      console.log("CREATING WORKER NODE")

      const awsEC2KeyPairName = `${workerNodeStackName}-Key`;
      const awsEC2KeyPairParam = { [awsProps.EC2_KEY_PAIR]: awsEC2KeyPairName };
      
      console.log("awsEC2KeyPairParam: ", awsEC2KeyPairParam);
      
      const isKeyPairInMasterFile = await awsHelperFunctions.checkAWSMasterFile(awsProps.EC2_KEY_PAIR, awsEC2KeyPairName);

      console.log("isKeyPairInMasterFile: ", isKeyPairInMasterFile);

      if (!isKeyPairInMasterFile) {
        const keyPair = await ec2.createKeyPair(awsEC2KeyPairParam).promise();
        console.log('Here is the newly created key pair for this cluster:', keyPair);
        await awsHelperFunctions.appendAWSMasterFile(awsEC2KeyPairParam);
      } else {
        console.log("aws key value pair already set");
      }

      const techStackParam = awsParameters.createWorkerNodeStackParam(clusterName, workerNodeStackName, stackTemplateForWorkerNode);

      //Send tech stack data to AWS to create stack 
      await cloudformation.createStack(techStackParam).promise();

      const getStackDataParam = { StackName: workerNodeStackName };

      let stringifiedStackData;
      let parsedStackData;
      let stackStatus = "CREATE_IN_PROGRESS";

      const getStackData = async () => {
        try {
          const stackData = await cloudformation.describeStacks(getStackDataParam).promise();
          stringifiedStackData = JSON.stringify(stackData.Stacks, null, 2);
          parsedStackData = JSON.parse(stringifiedStackData);
          stackStatus = parsedStackData[0].StackStatus;
        } catch (err) {
          throw ` ${err}`;
        }
      }
    
      //check with AWS to see if the stack has been created, if so, move on. If not, keep checking until complete. Estimated to take 1 - 1.5 mins.
      while (stackStatus === "CREATE_IN_PROGRESS") {
        console.log("stackStatus in while loop: ", stackStatus);
        // wait 30 seconds before rerunning function
        await awsHelperFunctions.timeout(1000 * 30)
        getStackData();
      }

      if (stackStatus === "CREATE_COMPLETE") {

        const stackDataForMasterFile = {
          workerNodeStackName: parsedStackData[0].StackName,
          nodeInstanceRoleArn: parsedStackData[0].Outputs[0].OutputValue,
        };

        console.log("stackDataForMasterFile: ", stackDataForMasterFile)
        await awsHelperFunctions.appendAWSMasterFile(stackDataForMasterFile);

      } else {
        
        console.log(`Error in creating stack. Stack Status = ${stackStatus}`)
        throw `${stackStatus}`;

      }
    } else {
      console.log("Workernode stack already exists")
      return `AWS Worker Node stack with the name ${clusterName}-worker-node already exists. Continuing with the creation process, and attaching elements to ${clusterName}-worker-node stack.`;

    }

  } catch (err) {
    console.log('Error coming from within kubectlConfigFunctions.createStackForWorkerNode', err);
    throw `${err}`;

    
  }
}


//** --------- INPUT NODE INSTANCE ROLE INTO THE was-auth-cm.yaml AND APPLY -- **//
/** 
 * @param {String} iamRoleName
 * @param {String} clusterName
 */
kubectlConfigFunctions.inputNodeInstance = async (clusterName) => {

  console.log("Inside kubectlConfigFunctions.inputNodeInstance: ", clusterName);

  try {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
    console.log('==============  kubectlConfigFunctions.inputNodeInstance ============')
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')

    const workerNodeStackName = `${clusterName}-worker-node`;

    console.log("process.env['KUBECONFIG']: ", process.env['KUBECONFIG'])

    //check env variable
    // if (process.env['KUBECONFIG'] !== `:${process.env['HOME']}/.kube/config-${clusterName}`) {
    //   console.log("process.env was not set", process.env['KUBECONFIG'])
    //   process.env['KUBECONFIG'] = `:${process.env['HOME']}/.kube/config-${clusterName}`;
    // }
  
    // const authFileExists = fs.existsSync(process.env['KUBECTL_STORAGE'] + `AUTH_FILE_${workerNodeStackName}.yaml`);

    // if (!authFileExists) {

    console.log('!!!!!!!!!!!!!!!!!!!!!--------auth file time--------------!!!!!!!!!!!!!!!!!!!!!!!!!!')

    const awsMasterFileData = await fsp.readFile(process.env['AWS_STORAGE'] + `AWS_Private/${clusterName}_MASTER_FILE.json`, 'utf-8');
  
    const parsedAWSMasterFileData = JSON.parse(awsMasterFileData);
    const nodeInstanceRoleArn = parsedAWSMasterFileData.nodeInstanceRoleArn;

    console.log("node instance role arn from master file: ", nodeInstanceRoleArn);
    
    const nodeInstanceTemplateRead = await fsp.readFile(process.env['AWS_STORAGE'] + 'Policy_Documents/node-instance-template.yaml', 'utf-8');

    const updatedNodeInstanceTemplate = nodeInstanceTemplateRead.replace(/<NodeInstanceARN>/, nodeInstanceRoleArn);

    console.log("updatedNodeInstanceTemplate", updatedNodeInstanceTemplate);


    await fsp.writeFile(process.env['KUBECTL_STORAGE'] + `AUTH_FILE_${workerNodeStackName}.yaml`, updatedNodeInstanceTemplate);

    const filePathToAuthFile = path.join(process.env['KUBECTL_STORAGE'], `AUTH_FILE_${workerNodeStackName}.yaml`);

    console.log("filepath: ", filePathToAuthFile);
    
    //Command Kubectl to configure by applying the Auth File
    const kubectlApplyChild = spawnSync('kubectl', ['apply', '-f', filePathToAuthFile]);
    let stdout = kubectlApplyChild.stdout.toString();
    let stderr = kubectlApplyChild.stderr.toString();
    console.log('stdout', stdout, 'stderr', stderr);

    if (stderr) throw stderr;

    // set a short timeout here to allow for the kubectl apply to take place
    console.log('waiting 5 seconds')
    await awsHelperFunctions.timeout(5000);

    // const kubectlGetChild = spawnSync('kubectl', ['get', 'nodes']);
    // stdout = kubectlGetChild.stdout.toString();
    // stderr = kubectlGetChild.stderr.toString();
    // console.log('stdout', stdout, 'stderr', stderr);

    // if (stderr) {
    //   throw `${stderr}`
    // }
    // console.log('Kubectl configured');
    // return 'Kubectl configured';
    

  } catch (err) {
    console.log('Error coming from within kubectlConfigFunctions.inputNodeInstance: ', err);
    throw `${err}`;
  }

}

kubectlConfigFunctions.testKubectlStatus = async () => {

  console.log("testing status")

  try {

    let successfulOutput;
    let errorMessage;

    const getKubectlStatus = () => {

      console.log("getting status");
      const kubectlStatus = spawnSync('kubectl', ['get', 'nodes'], { 'timeout': 15000 } );
      successfulOutput = kubectlStatus.stdout.toString();
      errorMessage = kubectlStatus.stderr.toString();

      console.log('successfulOutput: ', successfulOutput, 'errorMessage: ', errorMessage);

      if (errorMessage) throw errorMessage;
    }

    console.log("get status");

    getKubectlStatus();

    while (successfulOutput.includes('NotReady')) {
      console.log("successfulOutput status: ", successfulOutput)
        // wait 10 seconds before rerunning function
      await awsHelperFunctions.timeout(10000);
      getKubectlStatus();
    }

    if ((successfulOutput.includes('Ready')) && (!successfulOutput.includes('Not'))) {
     console.log(`Kubectl successfully configured: ${successfulOutput}, errorMessage: ${errorMessage}`);
     return true;

    } else {
      return false;
    }
 
  
  } catch (err) {
    console.log(err)
    return false;
  }

}


module.exports = kubectlConfigFunctions;


