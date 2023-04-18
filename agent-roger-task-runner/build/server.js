console.log("Starting up! Importing dependencies...");
import * as dotenv from "dotenv";
import weaviate, { ApiKey } from "weaviate-ts-client";
import { handleTask } from "./task";
// load env vars
dotenv.config();
import { drizzle, } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
// globals
let weaviateClient;
let sqlClient;
const initialize = () => {
    // connect to weavius
    weaviateClient = weaviate.client({
        scheme: "https",
        host: "some-endpoint.weaviate.network",
        apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
    });
    console.log("connected to weavius");
    console.log(weaviateClient);
    // connect to sql
    sqlClient = drizzle(connect({
        host: process.env.DATABASE_HOST,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    }));
    console.log("connected to sql");
    console.log(sqlClient);
    // connect to sql
    // Their example:
    // client.schema
    //   .getter()
    //   .do()
    //   .then((res: any) => {
    //     console.log(res);
    //   })
    //   .catch((err: Error) => {
    //     console.error(err);
    //   });
    // You can also use await instead of .then()
};
const runNextTask = async () => {
    // get next task, if there is one
    const task = await getNextTask();
    if (task === null)
        return;
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await handleTask(task);
};
const getNextTask = () => {
    // TODO scan graph db for a task with awaiting_children=false and completed=false and paused=false
    // TODO get task data from sql
    // TODO return the task with data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: 1, type: "test" });
        }, 1000);
    });
};
const main = () => {
    console.log("Running main...");
    initialize();
    while (true) {
        runNextTask().catch((error) => {
            console.log("Error running task: ", error);
        });
    }
};
try {
    main();
}
catch (error) {
    console.log("Error starting the task runner:");
    console.log(error);
}
//# sourceMappingURL=server.js.map