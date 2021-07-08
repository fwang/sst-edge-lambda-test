import * as cf from "@aws-cdk/aws-cloudfront";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const edgeFunc = new cf.experimental.EdgeFunction(this, "MyFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "lambda.handler",
      code: lambda.Code.fromAsset("src"),
      stackId: `${scope.logicalPrefixedName("edge-lambda")}`,
    });

    const site = new sst.StaticSite(this, "Site", {
      path: "site",
      cfDistribution: {
        defaultBehavior: {
          edgeLambdas: [
            {
              functionVersion: edgeFunc.currentVersion,
              eventType: cf.LambdaEdgeEventType.VIEWER_RESPONSE,
            },
          ],
        },
      },
    });

    // Show the endpoint in the output
    this.addOutputs({
      "SiteEndpoint": site.url,
    });
  }
}
