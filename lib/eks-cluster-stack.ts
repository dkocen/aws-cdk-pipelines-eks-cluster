import * as cdk from "aws-cdk-lib";
import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ssm from "aws-cdk-lib/aws-ssm";

import { ExternalDNS } from "./infrastructure/external-dns";
import { ContainerInsights } from "./infrastructure/container-insights";
import { Calico } from "./infrastructure/calico";
import { Echoserver } from "./application/echoserver";

export interface EksClusterStackProps extends cdk.StackProps {
  clusterVersion: eks.KubernetesVersion;
  nameSuffix: string;
}

export class EksClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EksClusterStackProps) {
    super(scope, id, props);


    const cluster = new eks.FargateCluster(this, `acme-${props.nameSuffix}`, {
      clusterName: `acme-${props.nameSuffix}`,
      version: props.clusterVersion,
      albController: {
          version: eks.AlbControllerVersion.V2_4_1
      }
    });

    const aud = `${cluster.clusterOpenIdConnectIssuer}:aud`;
    const sub = `${cluster.clusterOpenIdConnectIssuer}:sub`;

    const conditions = new cdk.CfnJson(this, "awsNodeOIDCCondition", {
      value: {
        [aud]: "sts.amazonaws.com",
        [sub]: "system:serviceaccount:kube-system:aws-node",
      },
    });

    const awsNodeIamRole = new iam.Role(this, "awsNodeIamRole", {
      assumedBy: new iam.WebIdentityPrincipal(
        `arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:oidc-provider/${cluster.clusterOpenIdConnectIssuer}`
      ).withConditions({
        StringEquals: conditions,
      }),
    });

    awsNodeIamRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy")
    );

    const hostZoneId = ssm.StringParameter.valueForStringParameter(
      this,
      "/eks-cdk-pipelines/hostZoneId"
    );

    const zoneName = ssm.StringParameter.valueForStringParameter(
      this,
      "/eks-cdk-pipelines/zoneName"
    );

    // new ExternalDNS(this, "ExternalDNS", {
    //   cluster: cluster,
    //   hostZoneId: hostZoneId,
    //   domainFilters: [`${props.nameSuffix}.${zoneName}`],
    // });

    // new ContainerInsights(this, "ContainerInsights", {
    //   cluster: cluster,
    // });

    // new Calico(this, "Calico", {
    //   cluster: cluster,
    // });

    // new Echoserver(this, "EchoServer", {
    //   cluster: cluster,
    //   nameSuffix: props.nameSuffix,
    //   domainName: zoneName,
    // });
  }
}
