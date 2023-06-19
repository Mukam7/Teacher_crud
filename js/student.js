let studentsRow = document.getElementById("students");
const student = document.getElementById("firstName");
const studentLast = document.getElementById("lastName");
const studentGroup = document.getElementById("groups");
const studentEmail = document.getElementById("email");
const studentphoneNumber = document.getElementById("phoneNumber");
const studentIsWork = document.getElementById("isWork");
const studentField = document.getElementById("field");
const studentImage = document.getElementById("avatar");

const studentForm = document.getElementById("studentForm");
const studentModal = document.getElementById("student-modal");
const studentBtn = document.getElementById("student-add-btn");
const modalOpenBtn = document.getElementById("modal-open-btn");
const studentSearch = document.getElementById("student_search");
const pagination = document.querySelector(".pagination");

let teacherId = localStorage.getItem("teacher");
let selected = null;
let page = 1;
let limit = 4;
let pagination_items;

const getStudentCard = ({
  id,
  avatar,
  firstName,
  lastName,
  birthday,
  email,
  isWork,
  field,
  phoneNumber,
}) => {
  return `<div class="col-md-6">
            <div class="card mb-2">
              <img height="300px" style={objectFit: 'cover'} src=${avatar} class="card-img-top" />
              <div class="card-body">
              <div class="d-flex gap-1">
                  <h5 class="card-title">${firstName}</h5>
                  <h5 class="card-title">${lastName}</h5>
              </div>
              <div>
                  <span class="card-birthday"><b>${birthday}</b></span>
              </div>
              <div>
                  <p class="card-email mt-2">${email}</p>
              </div>
              <div class="mb-2">
                  <tel class="studentteacher__phone"><b>${phoneNumber}</b></tel>        
              </div>
              <div class="d-flex align-items-center justify-content-between">
                  <h5 class="student__married">${
                    isWork ? "Ishlaydi" : "Ishlamaydi"
                  }</h5>
                  <h6>${field}</h6>
              </div>
              <div class="d-flex justify-content-between gap-2">
                  <button class="btn btn-warning student__btn" onclick="deleteStudent(${id})" >Del</button>
                  <button class="btn btn-primary student__btn" onclick="editStudent(${id})" data-bs-toggle="modal" data-bs-target="#student-modal">Edit</button>
              </div>
              </div>      
          </div>
        </div>`;
};

async function getStudents() {
  let searchValue = studentSearch.value.trim();

  let url =
    ENDPOINT + `teacher/${teacherId}/student?page=${page}&limit=${limit}`;
  if (searchValue) {
    url += `&firstName=${searchValue}`;
  }

  let res = await fetch(url, {
    method: "GET",
  });
}

studentSearch.addEventListener("keyup", function () {
  getStudents();
});

getStudents();

studentForm.addEventListener("submit", function (e) {
  e.preventDefault();
  let check = this.checkValidity();
  this.classList.add("was-validated");
  if (check) {
    bootstrap.Modal.getInstance(studentModal).hide();
    let data = {
      firstName: student.value,
      lastName: studentLast.value,
      avatar: studentImage.value,
      email: studentEmail.value,
      isWork: studentIsWork.checked,
      field: studentField.value,
      phoneNumber: studentphoneNumber.value,
    };
    if (selected) {
      fetch(ENDPOINT + `/teacher/${teacherId}/student/${selected}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "content-type": "application/json" },
      }).then(() => {
        alert("Student is edited");
        getStudents();
        emptyForm();
      });
    } else {
      fetch(ENDPOINT + `teacher/${teacherId}/student`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "content-type": "application/json" },
      }).then(() => {
        alert("Student is added");
        getStudents();
        emptyForm();
      });
    }
  }
});

studentphoneNumber.addEventListener("input", function () {
  let inputValue = studentphoneNumber.value;
  let phoneRegex = /^\+998\(\d{2}\)\d{3}-\d{2}-\d{2}$/;
  let isPhoneValid = phoneRegex.test(inputValue);
  studentphoneNumber.setCustomValidity(
    isPhoneValid
      ? ""
      : "Please enter a valid phone number in the format +998(XX)XXX-XX-XX"
  );
});

function editStudent(id) {
  selected = id;
  studentBtn.innerHTML = "Save student";
  fetch(ENDPOINT + `teacher/${teacherId}/student/${id}`)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      student.value = res.firstName;
      studentLast.value = res.lastName;
      studentImage.value = res.avatar;
      studentEmail.value = res.email;
      studentphoneNumber.value = res.phoneNumber;
      studentIsWork.checked = res.isWork;
      studentField.value = res.field;
    });
}

function deleteStudent(id) {
  let check = confirm("Rostanam o'chirishni xohlaysizmi ?");
  if (check) {
    fetch(ENDPOINT + `teacher/${teacherId}/student/${id}`, {
      method: "DELETE",
    }).then(() => {
      getStudents();
    });
  }
}

function emptyForm() {
  student.value = "";
  studentLast.value = "";
  studentImage.value = "";
  studentEmail.value = "";
  studentphoneNumber.value = "";
  studentIsWork.value = "";
  studentField.value = "";
}
emptyForm();

modalOpenBtn.addEventListener("click", () => {
  selected = null;
});

async function getPagination() {
  let pagination_numbers = "";
  let res = await fetch(ENDPOINT + `teacher/${teacherId}/student`);
  let students = await res.json();
  const students_number = students.length;
  const pagination_items = Math.ceil(students_number / limit);

  Array(pagination_items)
    .fill(1)
    .forEach((item, index) => {
      pagination_numbers += `<li class="page-item ${
        page == index + 1 ? "active" : ""
      }" onclick="getPage(${index + 1})">
        <span class="page-link">
          ${index + 1}
        </span>
      </li>`;
    });

  pagination.innerHTML = `
    <li onclick="getPage('-')" class="page-item ${
      page == 1 ? "disabled" : ""
    }"><button class="page-link" href="#">Previous</button></li>
    ${pagination_numbers}
    <li onclick="getPage('+')" class="page-item ${
      page == pagination_items ? "disabled" : ""
    }"><button class="page-link" href="#">Next</button></li>
  `;
}

getPagination();

async function getStudents() {
  studentsRow.innerHTML = `<div class="loading-container">
    <div class="loading-animation">
      <img
        src="img/spiner.png"
        alt="image"
        class="rotating-image"
      />
    </div>
  </div>`;

  let res = await fetch(
    ENDPOINT + `teacher/${teacherId}/student?page=${page}&limit=${limit}`
  );
  let students = await res.json();
  studentsRow.innerHTML = "";

  students.forEach((student) => {
    studentsRow.innerHTML += getStudentCard(student);
  });
}

function getPage(p) {
  if (p == "+") {
    page++;
  } else if (p == "-") {
    page--;
  } else {
    page = p;
  }

  if (page > 0) {
    getStudents();
    getPagination();
  }
}
