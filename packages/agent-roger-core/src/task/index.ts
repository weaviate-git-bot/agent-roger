import TASK_PRESETS from "./presets.js";
export { TASK_PRESETS };

/** DEFAULT ABSTRACT TASK OVERVIEW:
       

      
Runs initial stages:
// gets semanticContextQueries json {semanticContextQueries: string[]}
// gets keywordContextQueries json {keywordContextQueries: string[]}
// gets semanticQueryEmbeddings json {semanticQueryEmbeddings: number[][]}
// gets rawContext json {rawContext: document[]}
// gets summarizeContextChildTaskID's resultData: string as db contextSummary
// gets stepsAndSuccessCriteria json {steps: string[], successCriteria: string[]}

Runs generateSubTasks stage:
while (internalData.stepIdxToSubTaskID.length < numSteps || a child ARBITRARY task isn't done)
...
do:
--
1. run step personalization for the next stepIdx that has its required dependency-step data in db(internalData.stepIdxToSubTaskID[stepIdx]).resultData;
2. generates sub-task definition and starts sub-task;
--

Runs final stages:
// gets summarizeSubTaskOutputs task's resultData: string as db subTasksSummary
// gets validationSummary string
// gets correctiveAction json {shouldPause: boolean, newInitialInput: json, newInitialContextSummary: string, newInitialContextFields: json}}

*/

/** DEFAULT ABSTRACT TASK'S STAGES:




   "GENERATE_SEMANTIC_CONTEXT_QUERIES"
  
Context hooks are generated by an LLM. These are distinct ideas, sentences, and
questions along the lines of, "What do I need to know in order to complete this task?"
       



  
   "GENERATE_KEYWORD_CONTEXT_QUERIES"
  
Context hooks are used to generate a list of keywords that are likely to be relevant to the task.
    
    
    
    

   "GENERATE_SEMANTIC_QUERY_EMBEDDINGS"
  
Uses an embedding AI model to vectorize the semantic context query/queries.

    
    
    

   "QUERY_RAW_CONTEXT"
  
Queries the document database using the semantic context query vector(s) and the keywords queries.
    




   "SUMMARIZE_CONTEXT"
  
If rawContext length is <1/6th of the token limit, then an EXECUTE_FUNCTION 
task (to summarize the context) is spawned and its output returned.

Otherwise, the context is split into overlapping chunks, recursively summarized 
by new SUMMARIZE_CONTEXT tasks, and the results are merged back into a 
context with length <1/6th of the token limit.

Each sub-task's input chunks can be any size, but it always outputs a single summary
with length <1/6th of the token limit.

Spawned by arbitrary task initially, and then recursively by SUMMARIZE_CONTEXT task.
      
// await EXECUTE_FUNCTION child, OR
// await SUMMARIZE_CONTEXT child

  
  
  
  
  
  

   "GENERATE_STEPS_AND_SUCCESS_CRITERIA"

Uses the LLM to populate 3 fields in the task's internalData: steps, stepDependencies: {idx: idx}, and successCriteria.

Steps do not necessarily correspond 1-1 with successCriteria, since criteria are for the
task as a whole.

Spawned by ABSTRACT_TASK.
    






   "GENERATE_STEP_PERSONALIZATION"
  
Gives a fine-tuned LLM contextSummary and a step. Receives helpful tips and reminders
on the user's preferences, based on training data, related to generating a task for the step.

Spawned by ABSTRACT_TASK.
     
     
     
     
     
     

   "GENERATE_SUB_TASKS"

Gives the LLM contextSummary, a step, its corresponding stepPersonalization[stepIdx], and stepIdxToSubTaskID[stepIdx]'s SQL resultData.
Receives a task definition (could be fairly long). Spawns a sub-task. Saves sub-task id to internalData.stepIdxToSubTaskID[stepIdx].
field dependencyStepOutput: {idx: json}

Remains in this stage until all children are complete and num alive ABSTRACT_TASK children == numSteps.

Spawned by ABSTRACT_TASK.
    
    
    
    
    
    
    

   "EXECUTE_FUNCTION"

Spawned by any task.
       







   "SUMMARIZE_SUB_TASK_OUTPUTS"
  
Outputs from an ARBITRARY task's sub-tasks are recursively summarized and 
merged using a similar method as for SUMMARIZE_CONTEXT tasks, except the
initial chunks are the discrete (non-overlapping, unlike for context) sub-task 
outputs.
    
    
    
    
    
    

   "VALIDATE_OUTPUT"
  
An ABSTRACT task's final output is put through the LLM to declare it valid 
according its success criteria, or to explain why it failed.

If validated, the ABSTRACT task will be marked as completed, and its parent task 
will trigger when all of its other children are also marked as completed.

If the ABSTRACT task failed, the input, contextSummary, and failure explanation will be saved into 
the vector db for future tasks to use as context.
    
    
    
    
    
    

   "DECIDE_CORRECTIVE_ACTION";

Asks the LLM either: decide to pause the task or, if the LLM thinks the task can be
completed, generate a modified input and initialContextSummary for the restarted task.

For example, the modified input could include "figure out why xx went wrong" in
addition to the broader task.
    

*/
