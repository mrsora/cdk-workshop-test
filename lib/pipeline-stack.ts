import { Stack, StackProps } from "aws-cdk-lib"
import { Repository } from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs"

export class WorkshopPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // pipeline code here
        const repo = new Repository(this, "WorkshopRepo", {
            repositoryName: "WorkshopRepo",
        });
    }
}