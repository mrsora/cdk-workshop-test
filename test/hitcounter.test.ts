import { Stack } from "aws-cdk-lib"
import { HitCounter } from "../lib/hitcounter"
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda"
import { Capture, Template } from "aws-cdk-lib/assertions"

test("construct creates 1 DDB table created", () => {
    const stack = new Stack()

    // WHEN
    new HitCounter(stack, "MyTestConstruct", {
        downstream: new Function(stack, "TestFunction", {
            runtime: Runtime.NODEJS_18_X,
            handler: "hello.handler",
            code: Code.fromAsset("lambda"),
        }),
    });

    // THEN
    const template = Template.fromStack(stack)
    template.resourceCountIs("AWS::DynamoDB::Table", 1)
})

test("HitCounter has two environment variables", () => {
    const stack = new Stack()

    // WHEN
    new HitCounter(stack, "MyTestConstruct", {
        downstream: new Function(stack, "TestFunction", {
            runtime: Runtime.NODEJS_18_X,
            handler: "hello.handler",
            code: Code.fromAsset("lambda"),
        }),
    });

    // THEN
    const template = Template.fromStack(stack)
    const envCapture = new Capture()

    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture,
    })

    expect(envCapture.asObject()).toEqual({
        Variables: {
            DOWNSTREAM_FUNCTION_NAME: {
                Ref: "TestFunction22AD90FC"
            },
            HITS_TABLE_NAME: {
                Ref: "MyTestConstructHits24A357F0"
            }
        }
    });
})

test("DynamoDB table is created with encryption", () => {
    const stack = new Stack()

    //WHEN
    new HitCounter(stack, "MyTestConstruct", {
        downstream: new Function(stack, "TestFunction", {
            runtime: Runtime.NODEJS_18_X,
            handler: "hello.handler",
            code: Code.fromAsset("lambda"),
        }),
    });

    //THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::DynamoDB::Table", {
        SSESpecification: {
            SSEEnabled: true,
        }
    })
})

test("error is thrown when read count is out of range", () => {
    const stack = new Stack()

    expect(() => {
        new HitCounter(stack, "MyTestConstruct", {
            downstream: new Function(stack, "TestFunction", {
                runtime: Runtime.NODEJS_18_X,
                handler: "hello.handler",
                code: Code.fromAsset("lambda"),
            }),
            readCapacity: 3,
        });
    }).toThrow("readCapacity must be greater than 5 and less than 20")
})