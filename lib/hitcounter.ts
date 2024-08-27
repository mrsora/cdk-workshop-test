import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface HitCounterProps {
    // the function for which we want to count url hits
    downstream: IFunction;
    readCapacity?: number;
}

export class HitCounter extends Construct {
    // allows accessing the counter function
    public readonly handler: Function

    // allows reading of the table
    public readonly table: Table;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        // throw error if read capacity is too large
        if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
            throw new Error("readCapacity must be greater than 5 and less than 20.")
        }

        this.table = new Table(this, 'Hits', {
            partitionKey: { name: "path", type: AttributeType.STRING },
            encryption: TableEncryption.AWS_MANAGED,
            readCapacity: props.readCapacity ?? 6,
            removalPolicy: RemovalPolicy.DESTROY
        });

        this.handler = new Function(this, "HitCounterHandler", {
            runtime: Runtime.NODEJS_18_X,
            handler: "hitcounter.handler",
            code: Code.fromAsset("lambda"),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: this.table.tableName,
            },
        });

        // grant lambda read/write permissions to the table
        this.table.grantReadWriteData(this.handler);

        // grant lambda invocation permissions for other lambda functions
        props.downstream.grantInvoke(this.handler);
    }
}