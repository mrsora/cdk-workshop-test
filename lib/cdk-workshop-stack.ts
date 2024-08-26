import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    // scope: `this` : scope is usually the current construct -> 'this' is the current construct
    // id: 'HelloHandler' : id is a unique identifier for the resource
    // props: { runtime, code, handler } : props is an object that defines the resource's properties

    const hello = new Function(this, "HelloHandler", {
      runtime: Runtime.NODEJS_18_X,    // execution environment
      code: Code.fromAsset("lambda"),  // code loaded from the "lambda" directory
      handler: "hello.handler",        // file is "hello", function is "handler"
    });

    // counter
    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello
    });

    // defines an API Gateway REST API resource
    const gateway = new LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler,
    });

    const tv = new TableViewer(this, 'ViewHitCounter', {
      title: "Hello Hits",
      table: helloWithCounter.table,
      sortBy: "-hits"
    });
  }
}
