$(document).ready(() => {
    console.log("ready");
    getTasksJson();
    searchTasks();
    checkQuantityOfTasks();
    checkTypeOfTasks();
    checkDate()
});


let getTasksJson = () => {
    $.ajax({
        url: "/tasks.json",		 	
		type: "GET",
		contentType: "application/json; charset=utf-8",
		dataType: "json",	
		success: function (event) {
            changeInTable.change({"newData": event});
        },
        error: function(err) {
            console.log(err);
        }
    })
}

let searchTasks = () => {
    changeInTable.change({"newSearch": ""});
    $(".search-tasks__input-search").keyup(function() {
        let searchPhrase = $(this).val();
        $.ajax({
            url: "/tasks.json",		 	
            type: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",	
            success: function (event) {
                changeInTable.change({"newSearch": searchPhrase});
            },
            error: function(err) {
                console.log(err);
            }
        })
    });
    
};

let checkQuantityOfTasks = (tasks, searchPhrase) => {
    let arrayOfAttrActive = $(".count-of-tasks span").children("a");
    changeInTable.change({"newQuantity": "20"});
    $(arrayOfAttrActive).click(function() {
        searchPhrase = $(this).val();
        $(arrayOfAttrActive).removeClass("count-of-tasks__count-link_selected");
        $(this).addClass("count-of-tasks__count-link_selected");
        changeInTable.change({"newQuantity": $(this).text()});
    });
};

let checkTypeOfTasks = () => {
    changeInTable.change({"typeOfTasks": $(".search-tasks__select").val()});
    return $(".search-tasks__select").val();
}

let checkConcurrences = (task, searchPhrase) => {
    let concurrences = false;
    for (let key in task) {
        if (task[key].toLowerCase().indexOf(searchPhrase) != -1) {
            concurrences = true;
            return concurrences;
        }
    }
    return concurrences;
}

let checkDate = () => {
    $(".search-tasks__input-date").val("2015-12");
    changeInTable.change({"date": $(".search-tasks__input-date").val()});
    $(".search-tasks__input-date").change(function() {
        changeInTable.change({"date": $(".search-tasks__input-date").val()});
    })
}

let sortTasksByType = (task, typeOfTasks) => {
    let concurrences = false;
    if (typeOfTasks == "open-tasks" && task["status"] == "Открыто") {
        concurrences = true;
    } else if (typeOfTasks == "completed-tasks" && task["status"] == "Выполнено") {
        concurrences = true;
    } else {
        return concurrences;
    }
    return concurrences;
}

let sortTasksByDate = (task, date) => {
    let concurrences = false;
    date = date.split("-");
    let needfulYear = date[0];
    let needfulMonth = date[1];
    let dateCreatedOfTask = task["created"].split(".");

    let dateUpdateOfTask = task["update"].split(".");

    let dateDeadline = task["deadline"].split('.');
    if (needfulYear == "20" + dateCreatedOfTask[2] && needfulMonth == dateCreatedOfTask[1]) {
        concurrences = true;
    } else if (needfulYear == "20" + dateUpdateOfTask[2] && needfulMonth == dateUpdateOfTask[1]) {
        concurrences = true;
    } else if (needfulYear == "20" + dateDeadline[2] && needfulMonth == dateDeadline[1]){
        concurrences = true;
    } else {
        return concurrences;
    }
    return concurrences;
}


let createTaskTable = (tasks, quantityOfTasks, searchPhrase, typeOfTasks, date) => {
    changeInTable.clearContent();
    $(".table-tasks").children().remove();
    let headerOfTable = "<tr>\
        <td><button onclick='sort(this)' value='image'>Т</button></td>\
        <td><button value='ticket'>Тикет</button></td>\
        <td><button onclick='sort(this)' value='title'>Название</button></td>\
        <td><button onclick='sort(this)' value='p'>П</button></td>\
        <td><button onclick='sort(this)' value='status'>Статус</button></td>\
        <td><button onclick='sort(this)' value='decision'>Решение</button></td>\
        <td><button onclick='sort(this)' value='created'>Создано</button></td>\
        <td><button onclick='sort(this)' value='update'>Обновлено</button></td>\
        <td><button onclick='sort(this)' value='deadline'>Дедлайн</button></td>\
    </tr>\n";
    let contentOfTable = headerOfTable;
    let n = 1;
    let k = 0;
    let m = 1;
    let finishContent = [];
    let pages = {"page1": []};
    for (let i = 0; i < tasks.length; i++) {
        
        if (searchPhrase) {
            let concurrences = checkConcurrences(tasks[i], searchPhrase);
            if (concurrences == false) continue;
        }
        
        if (sortTasksByType(tasks[i], typeOfTasks) == false) continue;
        
        if (sortTasksByDate(tasks[i], date) == false) continue;

        contentOfTable += "<tr>";
        
        for (let key in tasks[i]) {

            if (n == 2) {
                if (k < 9) {
                    contentOfTable += `<td><span>000${k + 1}</span></td>`;
                } else if (k >=9 && k < 99) {
                    contentOfTable += `<td><span>00${k + 1}</span></td>`;
                } else if (k >= 99 && k < 999) {
                    contentOfTable += `<td><span>0${k + 1}</span></td>`;
                } else {
                    contentOfTable += `<td><span>${k + 1}</span></td>`;
                }
            }
            if (n == 1) {
            	contentOfTable += `<td><span><img src="image/${tasks[i][key]}"></span></td>`;
            } else if (n == 3) {
                contentOfTable += `<td><span><img src="image/${tasks[i][key]}"></span></td>`;
            } else {
                contentOfTable += `<td><span>${tasks[i][key]}</span></td>`;
            }
            n++;
        }
        n = 1;
        k++;
        contentOfTable += "</tr>\n"; 
        changeInTable.saveContent(tasks[i]);
        if (k == quantityOfTasks * m) {
            
            pages[`page${m}`] = contentOfTable;
            contentOfTable = headerOfTable;
            m++;
        } else {
            pages[`page${m}`] = contentOfTable;
        }
    }
    $(".pages-of-tasks button").remove();
    createButtonsOfLists(pages);
    
    $(".table-tasks").append(pages["page1"]);
    if (changeInTable.getSortedClass()) {
        $(`.table-tasks button[value=${changeInTable.getSortedClass()}]`).addClass("sorted");
    }
}


let createButtonsOfLists = (pages) => {
    let arrayOfPages = [];
    if (Object.keys(pages).length <= 7) {
        for (let i = 0; i < Object.keys(pages).length; i++) {
            $(".pages-of-tasks").append(`<button class="number-of-page${i+1}">`);
            $(`.number-of-page${i+1}`).text(`${i+1}`);
        }
    } else {
        for (let i = 0; i < 6; i++) {
            $(".pages-of-tasks").append(`<button class="number-of-page${i+1}">`);
            $(`.number-of-page${i+1}`).text(`${i+1}`);
            if (i >= 1) {
                arrayOfPages.push(`<button class="number-of-page${i+1}">`);
            }
        }
        $(`.pages-of-tasks button:eq(5)`).text("...");
        $(".pages-of-tasks").append(`<button class="number-of-page${Object.keys(pages).length}">`);
        $(`.number-of-page${Object.keys(pages).length}`).text(`${Object.keys(pages).length}`);
        
    }
    $(`.pages-of-tasks button:eq(0)`).addClass("selectedPage");
    $(".pages-of-tasks button").click(function(el) {
    	if ($(el.target).hasClass("selectedPage")) {
    		return;
    	}
        let quantityOfPages = Object.keys(pages).length;
        let page = el.target.className.substr(el.target.className.lastIndexOf("-") + 1);
        let numberInButton = +el.target.className.substr(el.target.className.lastIndexOf("e") + 1);

        if (!(Object.keys(pages).length <= 7)) {

            let slidePages = (numberInButton, k) => {
                let m = 1;
                for (let i = k; i < k + 5; i++) {
                    $(`.pages-of-tasks button:eq(${m})`).removeClass($(`.pages-of-tasks button:eq(${m})`).attr("class"));
                    $(`.pages-of-tasks button:eq(${m})`).addClass(`number-of-page${numberInButton + i}`);
                    $(`.pages-of-tasks button:eq(${m})`).text(numberInButton + i);
                    m++;
                }
                m = 0;
            }
            if (($(el.target).index() >= 1 && $(el.target).index() < 6) && ((numberInButton >= 4) && (numberInButton <= quantityOfPages -3))) {
                slidePages(numberInButton, -2);

            } else if (numberInButton == quantityOfPages - 2) {
                slidePages(numberInButton, -3);

            } else if (numberInButton == 3) {
                slidePages(numberInButton, -1);

            } else if (numberInButton == quantityOfPages) {
                slidePages(numberInButton, -5);

            } else if (numberInButton == 1) {
                slidePages(numberInButton, 1);

            }

            if ($(`.pages-of-tasks button:eq(1)`).text() != 2) {
                $(`.pages-of-tasks button:eq(1)`).text("...");
            }

            if ($(`.pages-of-tasks button:eq(5)`).text() != quantityOfPages - 1) {
                $(`.pages-of-tasks button:eq(5)`).text("...");
            }
        }

        $(".table-tasks tr").remove();
        $(".table-tasks").append(pages[page]);
        $(`.pages-of-tasks button`).removeClass("selectedPage");
        $(`.pages-of-tasks button[class=number-of-page${numberInButton}]`).addClass("selectedPage");
        if (changeInTable.getSortedClass()) {
            $(`.table-tasks button[value=${changeInTable.getSortedClass()}]`).addClass("sorted");
        }
    });
}


function ChangeInTable() {
    this.newData;
    this.oldData;
    this.newQuantity = "20";
    this.newSearch = "";
    this.typeOfTasks;
    this.date;
    this.contentOfTable = [];
    this.value = "";
}

ChangeInTable.prototype.setSortedClass = function(value) {
    this.value = value;
}

ChangeInTable.prototype.getSortedClass = function() {
    return this.value;
}

ChangeInTable.prototype.clearContent = function() {
    this.contentOfTable = [];
}

ChangeInTable.prototype.saveContent = function(contentOfTable) {
    this.contentOfTable.push(contentOfTable);
}

ChangeInTable.prototype.getContent = function() {
    return this.contentOfTable;
}

ChangeInTable.prototype.change = function(change) {
    if (change["newData"]) {
        this.newData = change["newData"];
    }
    if (change["newQuantity"]) {
        this.newQuantity = change["newQuantity"];
        this.value = "";
        getTasksJson();
    }
    if (change["newSearch"] || change["newSearch"] == "") {
        this.newSearch = change["newSearch"];
        this.value = "";
        getTasksJson();
    }
    if (change["typeOfTasks"]) {
        this.typeOfTasks = change["typeOfTasks"];
        this.value = "";
        getTasksJson();
    }
    if (change["date"]) {
        this.date = change["date"];
        this.value = "";
        getTasksJson();
    }
    if (this.newData != undefined){
        createTaskTable(this.newData, this.newQuantity, this.newSearch, this.typeOfTasks, this.date);
    }
}

var changeInTable = new ChangeInTable();


let sort = (elem) => {
    let data = changeInTable.getContent();
    data.sort(function(a, b){
        return (a[elem.value] < b[elem.value]) ? -1 : (a[elem.value] > b[elem.value]) ? 1: 0;
    })
    changeInTable.setSortedClass(elem.value);
    changeInTable.change({"newData": data});
}
