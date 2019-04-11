import React from 'react';

/** ------------ NAVIGATION COMPONENT ------------------------------
  ** Rendered by the NavComponent via NavContainer;
  *Displays information on cluster when user  'Cluster Info' at top right of screen
  *Data comes from file saved on user's machine
*/

const ClusterInfoComponent = (props) => {
  const { clusterInfo } = props;

  const halfOfServerEndpoint = Math.floor(clusterInfo.serverEndPoint.length / 2);
  const serverEndPointFrontHalf = clusterInfo.serverEndPoint.slice(0, halfOfServerEndpoint);
  const serverEndPointBackHalf = clusterInfo.serverEndPoint.slice(halfOfServerEndpoint);

  return (
    <div className="cluster_info_container">
      <div className="cluster_info_major">
        <span className="cluster_info_key">CLUSTER NAME: </span>
        <span className="cluster_info_value">{clusterInfo.clusterName}</span>
      </div>
      <div className="cluster_info_minor">
        <span className="cluster_info_key">CLUSTER ARN: </span>
        <div className="cluster_info_subnets">{clusterInfo.clusterArn}</div>
      </div>
      <div className="cluster_info_major">
        <span className="cluster_info_key">IAM ROLE: </span>
        <span className="cluster_info_value">{clusterInfo.iamRoleName}</span>
      </div>
      <div className="cluster_info_minor">
        <span className="cluster_info_key">IAM ROLE ARN: </span>
        <div className="cluster_info_subnets">{clusterInfo.iamRoleArn}</div>
      </div>
      <div className="cluster_info_major">
        <span className="cluster_info_key"> STACK NAME: </span>
        <span className="cluster_info_value">{clusterInfo.stackName}</span>
      </div>
      <div className="cluster_info_minor">
        <span className="cluster_info_key">VPC ID: </span>
        <span className="cluster_info_value">{clusterInfo.vpcId}</span>
      </div>
      <div className="cluster_info_minor">
        <span className="cluster_info_key">SECURITY GROUP ID: </span>
        <span className="cluster_info_value">{clusterInfo.securityGroupIds}</span>
      </div>
      <div className="cluster_info_minor">
        <div className="cluster_info_key">SUBNET IDS: </div>
        <div className="cluster_info_subnets">{clusterInfo.subnetIdsArray[0]}</div>
        <div className="cluster_info_subnets">{clusterInfo.subnetIdsArray[1]}</div>
        <div className="cluster_info_subnets">{clusterInfo.subnetIdsArray[2]}</div>
      </div>
      <div className="cluster_info_minor">
        <div className="cluster_info_key">SERVER END POINT: </div>
        <div className="cluster_info_subnets">{serverEndPointFrontHalf}</div>
        <div className="cluster_info_server_end_point">{serverEndPointBackHalf}</div>
      </div>
      <div className="cluster_info_minor">
        <span className="cluster_info_key">KEY NAME: </span>
        <span className="cluster_info_value">{clusterInfo.KeyName}</span>
      </div>
    </div>
  );
};

export default ClusterInfoComponent;
