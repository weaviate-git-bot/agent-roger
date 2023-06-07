# Agent Roger (pre-alpha version)

### _An application for running AI tasks using a dynamic tree structure._

<img width="1512" alt="agent-roger-dem-1" src="https://github.com/maxilie/agent-roger/assets/6299223/b3adeb73-eca2-4fea-b774-2677d3ab706f">
<img width="1512" alt="agent-roger-dem-2" src="https://github.com/maxilie/agent-roger/assets/6299223/703e66aa-d01d-4b94-9b33-b9bf36fa5cb3">

### This repo includes: 
- Dashboard (Vercel app)
- Task Runner (Docker container)
- Redis database (Docker container)
- Weaviate database (Docker container)

## 🔍  What is Agent Roger?

**Agent Roger is an application that allows you to "steer" AI by chaining tasks and sub-tasks in a tree structure.**

The dashboard makes it easy to manage tasks that can branch out into sub-tasks and sub-tasks-of-sub-tasks, forming a tree structure. You can explore each tree visually, like a map, to see what steps the AI is taking and to change the parts you dislike without affecting the parts you do like. 

Agent Roger's purpose is similar to that of other AI agents. However, there are key differences...

<details>
   <summary>More Info</summary>

### Serves as an application rather than a framework:

- This repo contains code to launch a dashboard and task runner process(es) that require particular database setups, which are described below in the "Getting Started" section.

### Uses a _task tree_ instead of a queue:

- AI can delegate to arbitrary sub-tasks, branching out into sub-tasks-of-sub-tasks-of-etc.
- Independent sub-tasks are run concurrently.

### Task tree is _dynamic_:

- A single misstep in a sub-task does not necessarily ruin the overall task.
- A failed sub-task will try to improve until it is successful or has exhausted all reasonable options.
- User can provide feedback on a sub-task and restart a sub-tree while preserving the rest of the tree's independent logic.

### Practically free (excepting cost of inferencing tokens) to get started:

- As of publishing this, all default database vendors have unreasonably generous free tiers, and offer reasonable pay-as-you-go pricing should you exceed the free tier limits.

### Visualization of Data Flow:

- Interactive, zoomable task tree shows every thought and data point involved in your task.
- Ability to pause/modify/rerun sub-tasks.
  
### Uses Multi-Shot Prompting:
  
- Before generating AI output, the task runner finds examples of similar input & output from previous prompts, and injects them into the new prompt.
- Multi-shot prompting enables you to "fine-tune" the system without updating the AI model.
- When a sub-task fails, you can view all of its prompts, modify the responses to your liking, and add them to the injection list to be used when the AI is prompted with similar prompts in the future.

### Written in TypeScript:

- Uses the `zod` library for type checking, which enables better autocomplete, error handling, bug detection, etc.
- Enables the developer, the dashboard user, and the AI to be confident that any JSON data has the fields it expects -- even including custom schema generated by the AI or user.
- NOTE: If you're not using an API like OpenAI's, then you will still need to implement your own inference engine, likely using Python.

### Runs orders of magnitude more inferences and logic to execute a single sub-task than do traditional systems:

- Agent Roger is made for an age when inference is relatively cheap (think 200k tokens/second at $30 USD/hr for a 50B-parameter multi-modal model).
- This repo provides a starting point for exploring the possibilities of using dynamic, concurrency-friendly task trees.
- The problem of inference (two problems: fine-tuning models and inferencing them quickly) is left to the intelligent and determined reader.
  
### AI can switch its context between a global memory bank and local, task-specific memory banks.

- Memory banks are vector databases that store JSON documents and their embeddings.
- Currently we only store indexes of local files and summaries of previous tasks. Soon we will also store indexes of web content, information that the AI determines is commonly needed, and summaries of task trees.
- By default, a new memory bank is created for each new root task (user input), and documents are stored to both the new local memory bank and the global memory bank.
  - To save time, the AI will use the global memory bank if you tell it to (using plain english) in the root task's inputFields. For example, `inputFields: { "instructions": "Do some task. Use the global memory bank." }`.
  - Using the global memory bank is a trade-off: Tasks using the global memory bank will progress quicker as you run more of them, because they will remember how similar tasks were run and will already have the filesystem indexed. However, this could lead to the system remembering outdated prompts and file contents, which could cause the task to fail.
  - For best results, do not tell the system to use the global memory bank.

</details>

## ⚙️  Getting Started

The easiest way to get started is to:

1. Fork the repo.
2. Duplicate `.env.example` to a fresh `.env` (only in your local environment!).
3. Fill in the environment variables in `.env`, using the Setup Details (below) as a reference.

<details>
   <summary>Setup Details</summary>

You will need the following (free) infra, each of which can be spun up using vendors' websites:

- new Vercel app pointing at your forked GitHub repo (vercel.com)
- new PlanetScale MySQL database (planetscale.com)
- new Upstache Redis database (upstache.com)
- new Neo4J graph database (neo4j.com/auradb)
- new Clerk authentication app (clerk.com)
  - create a user, say, `adminUser`. create an organization called `admin` set its owner to the admin user.
  - only members of the `admin` organization will be able to access the dashboard.

Set environment variables:

- Use `.env.example` as a template which lists the requried environment variables.
- For local development, set correct environment variables in your `.env`.
- For deployment, set correct environment variables in the Vercel dashboard under Settings -> Environment Variables (you can copy/paste from your `.env` file).

</details>

## 🪄  Deploying
First, ensure your `.env` file is correct. Make sure Vercel's environment variables match your `.env` file.

#### Dashboard
Push to GitHub to trigger a new Vercel deployment of the dashboard.

<details>
  
  <summary>To run the dashboard on your local computer:</summary>

```bash
# install external dependencies
yarn install

# build core packages
yarn run build:core

# START THE DASHBOARD
yarn run start:dashboard # or:  yarn run dev
```

</details>

#### Vector Database
To start a Weaviate vector database:

```bash
yarn run start:vector-db
```

NOTE: It may be advisable to use a managed vector database if persistence is important to you, or if you are dealing with many documents.

#### Redis Database
To start a Redis database:

```bash
yarn run start:redis
```

NOTE: The redis database should be located as close to the task runner(s) as possible, as ping is very important. Data persistence is not important.

#### Task Runner
To start a task runner:

```bash
# build a docker image for task runner
yarn run build:task-runner

# run docker container
yarn run start:task-runner
```

## 🛞  IDE Setup

NOTE: We use yarn workspaces to configure the monorepo. You might need a Yarn "Editor SDK" in order for your IDE to properly recognize imports:

- `yarn dlx @yarnpkg/sdks vscode`
- Press ctrl+shift+p in a TypeScript file
- Choose "Select TypeScript Version"
- Pick "Use Workspace Version"
- See here for more info: https://yarnpkg.com/getting-started/editor-sdks#vscode

## ❓ Troubleshooting

The dashboard visualizer does not work with Brave browser's shields enabled:

- Specifically, the "block fingerprinting" option disables click functionality for the dashboard's force graph.

If docker fails to build, you may need to disable buildkit in your docker engine settings.

## 🧰  Making it Yours

You can customize the following parts of the `agent-roger-core` package:
#### Prompts
- Located in `packages/agent-roger-core/constants/prompts.ts`.
- The most fruitful place to start modifying prompts is the `SUGGESTED_APPROACHES` variable, which tells the AI what fields to output under what scenarios.

#### Stage Functions
- A stage function is a function that a task continuously calls until the stage is ended, at which point the task moves on to the next stage function.
- Each stage function has access to variables saved by the stage functions before it.
- Located in `packages/agent-roger-core/stage/...`.

#### Task Presets
- A task preset is just a name for a `TaskDefinition`, or a string key that maps to a `TaskDefinition` value.
- A `TaskDefinition` defines an array of stage functions to run, in order, before passing the task's output to its parent task. 
- Adding an entry to `TASK_PRESETS` allows the AI to spawn a task that runs your custom stage functions.
- Located in `packages/agent-roger-core/stage/presets.ts`.

### JSON Input & Output
The AI can accept any arbitrary JSON fields you provide it, and return JSON values for the named `outputFields` you request.
  - TODO: We will move to Microsoft's `guidance` format to: 1) more effectively communicate to the LLM how to use the tools it has available to it, and 2) enable LLM prompts to include a "blank space" for each named output field inline of one big context string (instead of being limited to a list of context fields and another list of requested output fields)

### Adding New Tools
To give the AI new functionality:
  - Create an `index.ts` file in a new folder: `packages/agent-roger-core/src/stage/task-<custom-task-name>`.
    - To keep it simple, you can perform all the task's logic in a single stage function.
    - Create your stage function by following the patterns of existing stage functions, like those in `packages/agent-roger-core/src/stage/task-execute-shell/index.ts`.
    - Follow the pattern for registering your new stage function(s) and task to the `packages/agent-roger-core/stage/presets.ts` file:
      - Modify the `stageFunctionsToRegister` array accordingly.
      - Modify the `TASK_PRESETS` map accordingly.
      - The "isAbstract" field should almost always be set to false. The system should only have one abstract task available to it (the task preset called "abstract" - see below file), which is responsible for breaking down an abstract task into simpler, more concrete sub-tasks.
  - Add a `SuggestedApproach` for your new task preset in the `packages/agent-roger-core/constants.prompts.ts` file, in the variable, `SUGGESTED_APPROACHES.generateSubTasks`.
    - Adding a `SuggestedApproach` tells the AI that the task preset is available to it, and specifies the input fields it expects.

### Modifying the Databases

<details>
   <summary>SQL Schema</summary>

1. Log in to planetscale.com.
2. Create a new branch of the main database and copy the credentials into your local `.env` file.
3. Change `/packages/agent-roger-core/src/db/sql-schema.ts` and other files as necessary.
4. Run `yarn workspace agent-roger-core db-push` to update the new PlanetScale branch.
5. Make any changes you need in order for the rest of the code to work with the new schema.
6. Once everything is working locally, go to the PlanetScale branch and create a new "deploy request", and then approve the deploy request to update the db main branch's schema.
  
</details>

<details>
   <summary>Vector Database</summary>

Weaviate powers Agent Roger's context logic:

- It stores documents as vector embeddings (lists of numbers) that represent semantic meaning.
- Weaviate seems to be a good solution because it allows for both vector and traditional keyword search, and it can be self-hosted locally on a decent CPU or in the cloud.

Switching to a different vector database:

- You will need to alter a few components: new environment variables, new Tasks using new Stages for retrieving and storing context, and possibly for embedding vectors (depending on the vector length setting of the database).
  
</details>
