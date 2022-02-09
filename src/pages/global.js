/*jshint esversion: 11 */

const convertToUXDate = d => {
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(d);
    return `${mo} ${da}, ${ye}`;
};

const getRemainingTime = (expiry) => {
    let secs = parseInt((expiry - new Date()) / 1000);

    if (secs < 0)
        return false;

    let hour = parseInt(secs / 60 / 60);
    let min = parseInt((secs % (60 * 60)) / 60);
    let sec = parseInt(secs % 60);

    return (`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
};

const validateEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const signUpOnLoad = () => {
    const btnPressed = document.createElement('style');
    btnPressed.type = 'text/css';
    btnPressed.innerHTML = '.btn-pressed {background-color: #953b39; color: white;}';
    document.getElementsByTagName('head')[0].appendChild(btnPressed);

    const teacherStudentOnClick = (ev) => {
        const el = ev.target;
        const isTeacher = el.classList.contains("teacher-btn");
        const isActive = el.classList.contains("btn-pressed");

        const tEl = document.getElementsByClassName("teacher-btn")[0];
        const sEl = document.getElementsByClassName("student-btn")[0];
        const inp = document.getElementById("isteacher");

        const selectTeacher = () => {
            sEl.classList.remove("btn-pressed");
            tEl.classList.add("btn-pressed");
            inp.value = true;
        };
        const selectStudent = () => {
            tEl.classList.remove("btn-pressed");
            sEl.classList.add("btn-pressed");
            inp.value = false;
        };

        if (isTeacher) {
            if (isActive)
                selectStudent();
            else
                selectTeacher();
        }
        else {
            if (isActive)
                selectTeacher();
            else
                selectStudent();
        }
    };

    const signUpForm = document.getElementsByClassName("sign-form")[0];
    const isTeacherInput = document.createElement('input');
    isTeacherInput.type = "checkbox";
    isTeacherInput.name = "isteacher";
    isTeacherInput.value = false;
    isTeacherInput.id = "isteacher";
    isTeacherInput.style.height = "0px";
    isTeacherInput.style.padding = "0px";
    isTeacherInput.style.visibility = "collapse";
    signUpForm.appendChild(isTeacherInput);
    document.getElementsByClassName('teacher-btn')[0].addEventListener('click', teacherStudentOnClick);
    document.getElementsByClassName('student-btn')[0].addEventListener('click', teacherStudentOnClick);
    document.getElementsByClassName('student-btn')[0].classList.add("btn-pressed");

    $("#email").removeClass("border-error");
    $("#password").removeClass("border-error");
    $("#confirm-password").removeClass("border-error");

    let isEmailValid = false;
    let isPasswordValid = false;
    let isConfirmPassValid = false;

    $("#email").focusout(() => {
        let emailVal = $("#email").val();

        if (emailVal != "") {
            if (!validateEmail(emailVal)) {
                $(".invalid").addClass("error");
                $("#email").addClass("border-error");
                isEmailValid = false;
            }
            else {
                $(".invalid").removeClass("error");
                $("#email").removeClass("border-error");

                $.post("/checkemail", { email: emailVal })
                    .done(function (data) {
                        if (data.result > 0) {
                            $(".email").addClass("error");
                            $("#email").addClass("border-error");
                            isEmailValid = false;
                        }
                        else {
                            $(".email").removeClass("error");
                            $("#email").removeClass("border-error");
                            isEmailValid = true;
                        }
                    });
            }
        }
        else {
            isEmailValid = false;
        }
        validateForm();
    });

    $("#password").focusout(() => {
        let passwordVal = $("#password").val();

        if (passwordVal.length < 8) {
            $("#password").addClass("border-error");
            $(".new").addClass("error");
            isPasswordValid = false;
        }
        else {
            $("#password").removeClass("border-error");
            $(".new").removeClass("error");
            isPasswordValid = true;
        }
        validateForm();
    });

    $("#confirm-password").focusout(() => {
        let passwordVal = $("#password").val();
        let confirmPassVal = $("#confirm-password").val();

        if (passwordVal != confirmPassVal) {
            $("#confirm-password").addClass("border-error");
            $(".confirm").addClass("error");
            isConfirmPassValid = false;
        }
        else {
            $("#confirm-password").removeClass("border-error");
            $(".confirm").removeClass("error");
            isConfirmPassValid = true;
        }
        validateForm();
    });

    const validateForm = () => {
        if (isEmailValid && isPasswordValid && isConfirmPassValid) {
            enableSubmit();
        }
        else {
            disableSubmit();
        }
    };

    const disableSubmit = () => {
        $(".signup-btn").attr("disabled", true);
        $(".signup-btn").removeClass("button");
    };

    const enableSubmit = () => {
        $(".signup-btn").removeAttr("disabled");
        $(".signup-btn").addClass("button");
    };

    $(".sign-form").submit((form) => {
        const data = $(".sign-form").serializeArray();
        const fData = {};
        data.forEach((field) => { fData[field.name] = field.value; });
        fData.isteacher = $("#isteacher").val() == 'true';

        console.log(fData);

        if ($(".sign-form")[0].reportValidity()) {
            if (isEmailValid && isPasswordValid && isConfirmPassValid) {
                $.post("/signup", fData)
                    .done(function (data) {
                        console.log(data);
                        if (data?.success) {
                            $(".title").text("Sign Up Successful");
                            $(".reminder").text("You have signed up successfully. Please log in");
                            $(".fas.fa.fa-times").hide();
                            $(".button.back").click(() => {
                                window.location.href = "/login.html";
                            });
                            $(".overlay-1").show();
                        }
                        else {
                            $(".title").text("Error in Signing Up");
                            $(".reminder").text("There was an error. " + data?.message);
                            $(".fas.fa.fa-times").click(() => {
                                $(".overlay-1").hide();
                            });
                            $(".button.back").click(() => {
                                $(".overlay-1").hide();
                            });
                            $(".overlay-1").show();
                        }
                    });
            }
        }

        return false;
    });
};

const profileOnLoad = () => {
    $(".loading-overlay").show();

    $(".new").hide();
    $(".confirm").hide();
    $("#newpassword").removeClass("border-error");
    $("#confirmpassword").removeClass("border-error");

    $("#newpassword").focusout(() => {
        let passwordVal = $("#newpassword").val();

        if (passwordVal != "") {
            if (passwordVal.length < 8) {
                $("#newpassword").addClass("border-error");
                $(".new").show();
                isPasswordValid = false;
            }
            else {
                $("#newpassword").removeClass("border-error");
                $(".new").hide();
                isPasswordValid = true;
            }
        }
    });

    $("#confirmpassword").focusout(() => {
        let passwordVal = $("#newpassword").val();
        let confirmPassVal = $("#confirmpassword").val();

        if (passwordVal != confirmPassVal) {
            $("#confirmpassword").addClass("border-error");
            $(".confirm").show();
            isConfirmPassValid = false;
        }
        else {
            $("#confirmpassword").removeClass("border-error");
            $(".confirm").hide();
            isConfirmPassValid = true;
        }
    });

    $.getJSON('./profile-json', data => {
        $("input[name='email']").val(data.username);
        $("input[name='firstname']").val(data.firstname);
        $("input[name='lastname']").val(data.lastname);

        if (data.type == 1) {
            $(".teacher-student")[0].children[0].classList.add("active");
            $(".teacher-student")[0].children[1].classList.remove("active");
        }
        $(".loading-overlay").hide();
    }).catch((error) => { alert(JSON.stringify(error)); });


};

const loginOnLoad = () => {
    $('#email').focusout(() => {
        const $result = $('#result');
        const email = $('#email').val();
        $result.text('');

        if (validateEmail(email)) {
            $("#email").removeClass("border-error");
            $("#email").siblings(".invalid").hide();
        } else {
            $("#email").addClass("border-error");
            $("#email").siblings(".invalid").show();
        }
        return false;
    });
    $(".button.login-btn").click((e) => {
        e.preventDefault();
        const displayError = message => {
            $(".reminder:first").text(message);
            $(".overlay-1:first").show();
        };
        if (validateEmail($("#email").val())) {
            $(".loading-overlay:first").show();
            $.post("/login", { email: $("#email").val(), password: $("#password").val() })
                .done(function (data) {
                    if (data?.success) {
                        window.location.href = "/dashboard";
                    }
                    else {
                        $(".loading-overlay").hide();
                        displayError(data.message);
                    }
                });
        }
        else {
            displayError("Please use a valid email address");
        }
    });
    $("a.button.back").click(() => {
        $(".overlay-1:first").hide();
    });
    $("i.fas.fa.fa-times").click(() => {
        $(".overlay-1:first").hide();
    });

    $("form:first").removeAttr("action");
    $("form:first").removeAttr("method");
    $(".loading-overlay").hide();
    $(".overlay-1").hide();
    $("#email").removeClass("border-error");
    $(".invalid").hide();
};

const sDashboardOnLoad = () => {
    $(".dropdown-content:first").children(":last").attr("href", "/logout");
    const classesContainer = $("#student-yes-class").children().first();
    classesContainer.html("");
    const postsContainer = $("#student-yes-announcement");
    postsContainer.html("");

    const addCardFunctions = () => {
        $("a[tag=card-leave-button]").click((e) => {
            console.log("heloasdf");
            $(".fas.fa.fa-times").click(() => {
                location.replace('#');
                $(".overlay-1").hide();
            });
            $(".button.back").click(() => {
                location.replace('#');
                $(".overlay-2").hide();
            });
            $(".button.account").click(() => {
                let classCode = parseInt(location.href.split('#')[1].split("-")[1]);
                $(".button.account").removeAttr("href");

                $.post("/removeclass", { classId: classCode })
                    .done(function (data) {
                        console.log(data);
                        location.replace('#');
                        if (data?.success) {
                            location.reload();
                        }
                        else {
                            alert(`An error has occured: ${data?.message}`);
                            location.reload();
                        }
                    });
            });
            $(".overlay-1").show();
        });
    };

    let loadStage = 0;

    $(".loading-overlay:first").show();

    $.get("/attendances", (raw_data) => {
        try {
            const data = JSON.parse(raw_data);
            let cardsBuilder = '';
            const timeredCards = [];
            if (data.length > 0) {
                $("#student-no-class").hide();
                $("#student-yes-class").show();
            }
            else {
                $("#student-no-class").show();
                $("#student-yes-class").hide();
            }
            data.forEach(classData => {
                const remaining = getRemainingTime(new Date(classData.expiry));
                const classCardTemplate =
                    `<div id="class_${classData.class_id}" class="subject-base">
                    <div class="subject no-attendance">
                        <div class="subject-top">
                            <div class="dropdown">
                                <a href="#"><i class="fa fa-cog" aria-hidden="true"></i></a>
                                <div class="dropdown-content" style="left: 0; top: 0; width: 9.3125rem; margin: 10px 0 0 37px;">
                                    <a tag="card-leave-button" id="card-leave-class-${classData.class_id}" href="#leave-${classData.class_id}">Leave Class</a>
                                </div>
                            </div>
                            <img src="images/profile.png" alt="profile">
                        </div>
                        <div class="subject-btm">
                            <div class="main">
                                <p class="main-sub">${classData.subject}</p>
                                <p class="main-sec">${classData.grade} | ${classData.section}</p>
                                <p class="main-teach">${classData.teacher}</p>
                            </div>
                            <div class="attend ${classData.attdate == null ? "inactive" : ""}">
                                <p class="attendance"><strong>Attendance for:</strong>
                                <span class="date">${convertToUXDate(new Date(classData.attdate))}</span></p>
                                <p class="limit"><strong>Time left:</strong> <span class="time">${classData.expiry}</span></p>
                            </div>
                            <div class="btns">
                                <a href="student-record.html?classId=${classData.class_id}" class="view">view</a>
                                <a href="#" class="button present ${classData.logtime == null && remaining ? "" : "inactive"}">present</a>
                                <a href="#" class="button done ${classData.logtime != null || !remaining ? "" : "inactive"}">done</a>
                            </div>
                        </div>
                    </div>
                </div>`;
                cardsBuilder += classCardTemplate;
                if (classData.attdate != null) {
                    timeredCards.push(classData);
                }
            });
            classesContainer.html(cardsBuilder);
            setInterval(() => {
                timeredCards.forEach(card => {
                    const elid = `class_${card.class_id}`;
                    let remaining = getRemainingTime(new Date(card.expiry));
                    if (!remaining)
                        location.reload();
                    $(`#${elid}`).find("span.time:first").text(remaining ? remaining : "Ended");
                });
            }, 999);
            loadStage++;
            console.log(loadStage);
            if (loadStage == 2)
                $(".loading-overlay:first").hide();
            addCardFunctions();
        } catch (error) {
            alert(error);
        }
    });
    $.get("/posts", (raw_data) => {
        const data = JSON.parse(raw_data);
        let cardsBuilder = '';
        if (data.length > 0) {
            $("#student-no-announcement").hide();
            $("#student-yes-announcement").show();
        }
        else {
            $("#student-no-announcement").show();
            $("#student-yes-announcement").hide();
        }
        data.forEach(post => {
            console.log("post", post);
            const postCardTemplate =
                `<div id="post_${post.post_id}" class="m-content">
                <div class="content-top">
                    <div class="content-detail">
                        <img src="images/profile.png" alt="profile">
                        <div class="from">
                            <p class="gra-sec"><span class="gra">${post.grade}</span> - <span class="sec">${post.section}</span></p>
                            <p class="teach">${post.teacher}</p>
                        </div>
                    </div>
                    <div class="dropdown">
                        <a href="#"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>
                        <div class="dropdown-content" style="right: 0; width: 9.3125rem; top: 0; margin: 0 0.625rem 0 0;">
                            <a href="#">Edit</a>
                            <a href="#">Delete</a>
                        </div>
                    </div>
                </div>
                <div class="content-mid">
                    <p class="message">${post.message}</p>
                </div>
                <p class="when">${convertToUXDate(new Date(post.dateposted))}</p>
            </div>`;
            cardsBuilder += postCardTemplate;
        });
        postsContainer.html(cardsBuilder);
        loadStage++;
        console.log(loadStage);
        if (loadStage == 2)
            $(".loading-overlay:first").hide();
    });

    $(".button.submit").click((e) => {
        let classCode = $("input[name=subject-code]").val();

        $.post("/addclass", { code: classCode })
            .done(function (data) {
                console.log(data);
                if (data?.success) {
                    $(".fas.fa.fa-times").click(() => {
                        location.reload();
                    });
                    $(".button.back").click(() => {
                        location.reload();
                    });
                    $(".overlay-3").show();
                }
                else {
                    $(".fas.fa.fa-times").click(() => {
                        $("input[name=subject-code]").val("");
                        $(".overlay-2").hide();
                    });
                    $(".button.back").click(() => {
                        $("input[name=subject-code]").val("");
                        $(".overlay-2").hide();
                    });
                    $(".overlay-2").show();
                }
            });
    });
};

const sRecordOnLoad = () => {
    $(".loading-overlay").show();
    $("#student-no-records").show();
    $("#student-yes-records").hide();
    $("a.student-remove").hide();
    $("i.fa.fa-angle-double-left").first().parent().removeAttr("href");
    $("i.fa.fa-angle-double-left").click(() => {
        history.back();
    });

    const curURL = new URL(location.href);
    const classId = curURL.searchParams.get("classId");
    const studentId = curURL.searchParams.get("studentId");

    $.getJSON(`/studentclassdata?classId=${classId}${studentId != null ? '&studentId=' + studentId : ''}`, data => {
        console.log(data);

        const _student = data?.student;
        const _class = data?.class;
        const _attendances = data?.attendances;

        $("h1.subject").text(_class?.subject);
        $("span.section").text(_class?.grade + "-" + _class?.section);
        $("span.student-section").text(_class?.grade + "-" + _class?.section);
        $("span.teacher").text(_class?.teacher);
        $("h3.student-name").text(_student?.firstname + " " + _student.lastname);

        if (_attendances?.length > 0) {
            let presentCounter = 0;
            let absentCounter = 0;

            $("#student-yes-records").html("");
            let attBuilder = "";
            _attendances.forEach((att) => {
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const forDate = (new Date(att.fordate)).toLocaleDateString('en-US', dateOptions);

                const timeOptions = { hour: '2-digit', minute: '2-digit' };
                const timeIn = att?.attendance == "Absent" ? "--:--" : (new Date(att?.time)).toLocaleDateString('en-US', timeOptions);
                const amPm = att?.attendance == "Absent" ? "--" : (new Date(att?.time)).getHours > 12 ? "PM" : "AM";

                const presentHTML = 
                `<div class="record">
                    <div class="record-flex">
                        <p class="date">${forDate}</p>
                        <p class="time">${timeIn} <span class="am-or-pm">${amPm}</span></p>
                        <p class="pres-or-abs">${att?.attendance}</p>
                    </div>
                </div>`;
                const absentHTML = 
                `<div class="record late">
                    <div class="record-flex">
                        <p class="date">${forDate}</p>
                        <p class="time">${timeIn} <span class="am-or-pm">${amPm}</span></p>
                        <p class="pres-or-abs">${att?.attendance}</p>
                    </div>
                </div>`;

                if (att?.attendance == "Present") {
                    attBuilder += presentHTML;
                    presentCounter++;
                }
                else {
                    attBuilder += absentHTML;
                    absentCounter++;
                }
            });
            $("#student-yes-records").html(attBuilder);

            $("#student-no-records").hide();
            $("#student-yes-records").show();

            $(".circle.number-attend").text(presentCounter);
            $(".circle.number-absen").text(absentCounter);
        }
        else {
            $(".circle.number-attend").text("...");
            $(".circle.number-absen").text("...");
        }

        $(".loading-overlay").hide();
    });
};