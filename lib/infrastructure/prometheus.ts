import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export interface PrometheusProps {
  cluster: eks.Cluster;
}

export class Prometheus extends Construct {
  constructor(scope: Construct, id: string, props: PrometheusProps) {
    super(scope, id);

    props.cluster.addHelmChart("Prometheus", {
      chart: "prometheus",
      release: "prometheus",
      version: "14.6.0",
      repository: "https://prometheus-community.github.io/helm-charts",
      values: {
        alertmanager: {
          persistentVolume: {
            storageClass: "gp2",
          },
        },
        server: {
          persistentVolume: {
            storageClass: "gp2",
          },
        },
      },
      namespace: "prometheus",
    });
  }
}
