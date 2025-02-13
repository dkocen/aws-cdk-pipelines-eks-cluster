import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";

export interface CalicoProps {
  cluster: eks.Cluster;
}

export class Calico extends Construct {
  constructor(scope: Construct, id: string, props: CalicoProps) {
    super(scope, id);

    props.cluster.addHelmChart("Calico", {
      chart: "tigera-operator",
      release: "calico",
      repository: "https://docs.projectcalico.org/charts",
      version: "v3.26.1",
      values: {
        installation: {
          kubernetesProvider: "EKS",
        },
      },
      namespace: "kube-system",
    });
  }
}
