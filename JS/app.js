const newUserID = document.querySelector("[name='newUserID']");
const newFirstName = document.querySelector("[name='newFirstName']");
const newLastName = document.querySelector("[name='newLastName']");
const newMiddleName = document.querySelector("[name='newMiddleName']");
const newPassword = document.querySelector("[name='newPassword']");
const newBirthDate = document.querySelector("[name='newBirthDate']");
const newPicture = document.querySelector("[name='newPicture']");
const newRegistered = document.querySelector("[name='newRegistered']");

const btn_showItemToOrder = document.querySelector("[name='showItemToOrder']");
const btn_addItemToOrder = document.querySelector("[name='addItemToOrder']");
const btn_addUser = document.querySelector("[name='addUser']");

const orderItem = document.getElementById('id_orderItem');
const orderTable = document.getElementById('id_orderTable');
const orderTableTbody = orderTable.querySelector('tbody');//что бы вставить строку в tbody

var isEditMode = false;
var validationSummary = "";

const apiURL = "http://localhost:55000/api/users";

const newUser = {};

var values = [];

function prepareValues() {
  return new Promise((resolve) => {
    $.get(apiURL, (data) => {
      Object.assign(values, data);

      resolve(values);
    });
  })
}

//заполняет строку новыми данными
function appendOrderItemValues(row, values)//передаются оба по ссылке
{
  let UserIDCell = row.insertCell(0);
  UserIDCell.innerHTML = values.UserID;

  let FirstNameCell = row.insertCell(1);
  FirstNameCell.innerHTML = values.FirstName;

  let LastNameCell = row.insertCell(2);
  LastNameCell.innerHTML = values.LastName;

  let MiddleNameCell = row.insertCell(3);
  MiddleNameCell.innerHTML = values.MiddleName;

  let PasswordCell = row.insertCell(4);
  PasswordCell.innerHTML = values.Password;

  let BirthDateCell = row.insertCell(5);
  BirthDateCell.innerHTML = values.BirthDate;

  let PictureCell = row.insertCell(6);
  PictureCell.innerHTML = values.Picture;

  let RegisteredCell = row.insertCell(7);
  RegisteredCell.innerHTML = values.Registered;

  let actionsCell = row.insertCell(8);
  actionsCell.innerHTML = "<input type='button' name='btnDeleteItem' onclick='deleteItem(this)' value='Delete'/> ";
  actionsCell.innerHTML += "<input type='button' name='btnEditItem' onclick='editItem(this)' value='Edit'/> ";

  newUserID.value = "";
  newFirstName.value = "";
  newLastName.value = "";
  newMiddleName.value = "";
  newPassword.value = "";
  newBirthDate.value = "";
  newPicture.value = "";
  newRegistered.value = "";

}

function createInput(newItemValue, type) {
  let newInput = document.createElement("input");
  newInput.type = type;
  newInput.value = newItemValue;
  return newInput;
}

function edit(editRow, values) {
  let FirstNameInput = createInput(values.FirstName, "text");
  editRow.childNodes[1].innerHTML = "";
  editRow.childNodes[1].appendChild(FirstNameInput);

  let LastNameInput = createInput(values.LastName, "text");
  editRow.childNodes[2].innerHTML = "";
  editRow.childNodes[2].appendChild(LastNameInput);

  let MiddleNameInput = createInput(values.MiddleName, "text");
  editRow.childNodes[3].innerHTML = "";
  editRow.childNodes[3].appendChild(MiddleNameInput);

  let PasswordInput = createInput(values.Password, "password");
  editRow.childNodes[4].innerHTML = "";
  editRow.childNodes[4].appendChild(PasswordInput);

  let BirthDateInput = createInput(values.BirthDate, "date");
  editRow.childNodes[5].innerHTML = "";
  editRow.childNodes[5].appendChild(BirthDateInput);

  let PictureInput = createInput(values.Picture, "text");
  editRow.childNodes[6].innerHTML = "";
  editRow.childNodes[6].appendChild(PictureInput);

  let RegisteredInput = createInput(values.Registered, "date");
  editRow.childNodes[7].innerHTML = "";
  editRow.childNodes[7].appendChild(RegisteredInput);

}

function editItem(button) {
  var editRow = button.parentNode.parentNode;

  newUser.FirstName = editRow.childNodes[1].innerHTML;
  newUser.LastName = editRow.childNodes[2].innerHTML;
  newUser.MiddleName = editRow.childNodes[3].innerHTML;
  newUser.Password = editRow.childNodes[4].innerHTML;
  newUser.BirthDate = editRow.childNodes[5].innerHTML;
  newUser.Picture = editRow.childNodes[6].innerHTML;
  newUser.Registered = editRow.childNodes[7].innerHTML;

  edit(editRow, newUser);

  if (!isEditMode) {
    button.parentNode.innerHTML += "<input type='button' name='btnSaveItem' onclick='saveItem(this)' value='Save'/>";
    isEditMode = true;
  }

}

function saveItem(button) {
  let editRow = button.parentNode.parentNode;

  for (let i = 1; i < 8; i++) {
    editRow.childNodes[i].innerHTML = editRow.childNodes[i].firstChild.value;
  }

  newUser.UserID = editRow.childNodes[0].innerHTML;
  newUser.FirstName = editRow.childNodes[1].innerHTML;
  newUser.LastName = editRow.childNodes[2].innerHTML;
  newUser.MiddleName = editRow.childNodes[3].innerHTML;
  newUser.Password = editRow.childNodes[4].innerHTML;
  newUser.BirthDate = editRow.childNodes[5].innerHTML;
  newUser.Picture = editRow.childNodes[6].innerHTML;
  if (editRow.childNodes[7].innerHTML) {
    newUser.Registered = editRow.childNodes[7].innerHTML;
  }
  else {
    let now = new Date();
    newUser.Registered = now.toISOString();
  }

  //PUT - запрос
  if (validate(newUser)) {
  $.ajax({
    type: "PUT",
    url: apiURL,
    data: newUser,
    success: (data) => { 
      showItemToOrder();
      if (isEditMode) isEditMode = false;

      let delButtonSave = button.parentNode;
      delButtonSave.removeChild(delButtonSave.childNodes[4]);//удаляем кнопку save
    
      alert("Пользователь успешно изменен");
    },
    dataType: "json"
  });
  }
  else {
    editItem(button);
    alert(validationSummary);
  }
}


function showItemToOrder() {
  // Получить всех пользователей
  let newRow = 0;

  prepareValues().then(() => {
    console.dir(values);
    while (orderTableTbody.firstChild) {
      orderTableTbody.removeChild(orderTableTbody.firstChild);
    }
    for (let item of values) {
      newRow = orderTableTbody.insertRow();//возвращает ссылку на новую строку в
      appendOrderItemValues(newRow, item);
    }

  });
};


function validate(User) {
  let result = true;
  validationSummary = "";
  let reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\s]).{6,}/;

  if (!User.FirstName) {
    result = false;
    validationSummary += "Имя пустое!\n";
  }

  if (!User.LastName) {
    result = false;
    validationSummary += "Фамилия пустая!\n";
  }

  if (!User.MiddleName) {
    result = false;
    validationSummary += "Отчество пустое!\n";
  }

  if (!User.Password) {
    result = false;
    validationSummary += "Пароль пуст!\n";
  }
  else if (reg.test(User.Password) == false) {
    result = false;
    validationSummary += "Введите корректный пароль. Пароль должен содержать буквы верхнего и нижнего регистров, цифры и символы!\n";
  }

  if (!User.BirthDate) {
    result = false;
    validationSummary += "Дата пустая!\n";
  }

  return result;
}

function submitUser() {
  newUser.UserID = newUserID.value;
  newUser.FirstName = newFirstName.value;
  newUser.LastName = newLastName.value;
  newUser.MiddleName = newMiddleName.value;
  newUser.Password = newPassword.value;
  newUser.BirthDate = newBirthDate.value;
  newUser.Picture = newPicture.value;
  if (newRegistered.value) {
    newUser.Registered = newRegistered.value;
  }
  else {
    let now = new Date();
    newUser.Registered = now.toISOString();
  }

  if (validate(newUser)) {
    $.post(apiURL, newUser, (data) => {
      showItemToOrder();
      hiddenTrue();
      alert("Пользователь успешно добавлен");
    });
  }
  else {
    alert(validationSummary);
  }
}

function hiddenTrue() {
  orderItem.querySelector('thead').hidden = true;
  orderItem.querySelector('tbody > tr:nth-child(1)').hidden = true;
  btn_addUser.hidden = true;
  btn_addItemToOrder.value = "Add To New User";
}

function hiddenFalse() {
  orderItem.querySelector('thead').hidden = false;
  orderItem.querySelector('tbody > tr:nth-child(1)').hidden = false;
  btn_addUser.hidden = false;
  btn_addItemToOrder.value = "Hide To New User";
}

function deleteItem(button) {
  if (isEditMode) isEditMode = false;

  var editID = button.parentNode.parentNode;

// //DELETE - запрос
$.ajax({
    type: "DELETE",
    url: apiURL + "/" + editID.childNodes[0].innerHTML,
    success: (data)=> { 
      if(data) 
      {    
        values.pop();
        showItemToOrder();
        alert("Пользователь успешно удален");
      }
    }
});
}

var check = true;
btn_addItemToOrder.addEventListener("click", () => {
  if (check) {
    hiddenFalse();
    check = false;
  }
  else {
    hiddenTrue();
    check = true;
  }
})

btn_showItemToOrder.addEventListener("click", showItemToOrder);

btn_addUser.addEventListener("click", submitUser);



























