import {createSorter} from './Sort';

const reorderListByDate = (givenFunc, taskList, taskListTasks, activeTVOrder, prop_to_order, user) => {
    return new Promise((resolve, reject)=>{


      if(taskListTasks == null || taskListTasks.length <= 0){
          console.error(`Bad tasklisttasks on reprioritize by ${prop_to_order}`);
          reject(`Bad tasklisttasks on reprioritize by ${prop_to_order}`)
      }
      if(!taskList.id){
          console.error("Bad taskListId in reorderListByDate");
          reject("Bad taskListId in reorderListByDate")
      }

      if(!givenFunc){
          console.error("Bad function given in reorderListByDate");
          reject("Bad function given in reorderListByDate")
      }
  
      var tmpArray = taskListTasks.sort(createSorter({property: prop_to_order, 
          direction: "ASC"}))
      
      var tmpNoInstall = tmpArray.filter((v,i)=> v[prop_to_order] == null || v[prop_to_order] == "0000-00-00 00:00:00" || v[prop_to_order] == "1970-01-01 00:00:00")
      var tmpInstall = tmpArray.filter((v,i)=> v[prop_to_order] != null || v[prop_to_order] != "0000-00-00 00:00:00" || v[prop_to_order] != "1970-01-01 00:00:00")
      var newTaskIds = [...tmpInstall, ...tmpNoInstall ].map((task,i)=> task.t_id);
      
      console.log(newTaskIds);
  
      givenFunc(newTaskIds,taskList.id, user, activeTVOrder)
      .then( (ok) => {
              if(!ok){
              throw new Error("Could not reorder tasklist" + taskList.id);
              }
              resolve(ok);
          })
      .catch( error => {
          console.error(error);
          reject(error);
      });
      
      
    })
  
}



module.exports = { 
    reorderListByDate,
}