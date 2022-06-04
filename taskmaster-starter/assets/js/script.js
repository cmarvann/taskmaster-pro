var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // Due Date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function(taskEl) {
// get date
var date = $(taskEl).find("span").text().trim();
console.log(date);

// convert at a specific time
var time = moment(date, "L").set("hour", 17);
console.log(time);

$(taskEl).removeClass("list-group-item-warning list-group-item-danger");

if (moment().isAfter(time)) {
  $(taskEl).addClass("list-group-item-danger");
}
else if (Math.abs(moment().diff(time, "days")) <= 2) {
  $(taskEl).addClass("list-group-item-warning");
}
};

//enable dragglable and sortable 
$(".card .list-group").sortable({
  //dragging across list 
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "done",
 
  activate: function(event, ui) {
    console.log(ui);
  },
  deactivate: function(event, ui) {
    console.log(ui);
  },
  over: function(event) {
    console.log(event);
  },
  out: function(event) {
    console.log(event);
  },
  update: function() {
    // array to store data
    var tempArr = [];

    // loop over current set of children in sortable list 
    $(this).children().each(function() {
      tempArr.push({
        text: $(this)
          .find("p")
          .text()
          .trim(),
      
        date: $(this)
          .find("span")
          .text()
          .trim()
        });
      }); 
      
      var arrName = $(this)
      .attr("id")
      .replace("list-", "");

      tasks[arrName] = tempArr;
      saveTasks();
    },
    stop: function(event) {
      $(this).removeClass("dropover");
    }
  });
          
// trash icon
$("#trask").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui){
    //remove drag element
    ui.droppable.remove();
  },
  over: function(event, ui) {
    console.log(ui);
  },
  out: function(event, ui) {
    console.log(ui);
  }
});

$("#modalDueDate").datepicker({
  // select future date add calendar
  minDate: 1
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// task text was clicked 
$(".list-group").on("click", "span", function(){
  // get current text of p elemnent
  var text = $(this)
  .text()
  .trim();

// replace p element with a new textarea
var textInput = $("<textarea>").addClass("form-control").val(text);
$(this).replaceWith(textInput);

// auto focus new element 
textInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function(){
  // get current value of textarea 
var text = $(this).val();

// get status type and position in the list 
var status = $(this).closest(".list-group").attr("id").replace("list-", "");

var index = $(this).closest(".list-group-item").index();

// update task in array and re-save to localstorage
tasks[status][index].text = text;
saveTasks();

// recreate p element
var taskP = $("<p>").addClass("m-1").text(text);

// replace textarea with new content 
$(this).replaceWith(taskP);
});


// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this).text().trim();
    

    // create new input element
    var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
    $(this).replaceWith(dateInput);

    // enable date picker
    dateInput.datepicker({
      minDate: 1,
      onClose: function() {
        $(this).trigger("change");
      }
    });

    // bring up calendar
    dateInput.trigger("focus");
});


  // value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this).val();

  // get position in the list and other elements
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes  replace input with span element
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

  $(this).replaceWith(taskSpan);
  auditTask($(taskSpan).closest(".list-group-item"));
});
  
// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});

// load tasks for the first time
loadTasks();


    
  