/*jshint esversion: 11 */

const convertToUXDate = d => {
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(d);
    return `${mo} ${da}, ${ye}`;
};

const getRemainingTime = expiry => {
    let secs = parseInt((expiry - new Date()) / 1000);

    if (secs < 0)
        return false;

    let hour = parseInt(secs / 60 / 60);
    let min = parseInt((secs % (60 * 60)) / 60);
    let sec = parseInt(secs % 60);

    return (`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
};

const validateEmail = email => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const createClassCode = length => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
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

    $.getJSON("/attendances", (raw_data) => {
        if (raw_data?.success)
            try {
                const data = raw_data?.result;
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
        else
            alert(raw_data?.message);
    });
    $.get("/posts", (raw_data) => {
        const data = raw_data?.result;
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
                            <p class="gra-sec"><span class="gra">${post.grade == null ? "All Grades" : post.grade}</span> - <span class="sec">${post.section == null ? "All Sections" : post.section}</span></p>
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

const tDashboardOnLoad = () => {
    const btnPressed = document.createElement('style');
    btnPressed.type = 'text/css';
    btnPressed.innerHTML = '.btn-pressed {background-color: #953b39 !important; color: white !important;}';
    document.getElementsByTagName('head')[0].appendChild(btnPressed);

    $("div.code").click(() => {
        $("i.fas.fa.fa-times").click(() => {
            $("div.overlay-3").hide();
        });
        $(".button.back").click(() => {
            $(".overlay-3").hide();
        });
        $(".button.account").click((e) => {
            e.preventDefault();
            let gradeLevel = $('input[name="grade-level"').val();
            let section = $('input[name="section"]').val();
            let subject = $('input[name="subject"]').val();

            if (gradeLevel == '') {
                alert('Please input grade level.');
                return;
            }
            if (section == '') {
                alert('Please input section.')
                return;
            }
            if (subject == '') {
                alert('Please input subject.');
                return;
            }

            let requestBody = {
                grade: `Grade ${gradeLevel}`,
                section: section,
                subject: subject,
                code: createClassCode(8)
            };

            $.post('/newclass', requestBody)
                .done((data) => {
                    if (data?.success) {
                        alert('The class has been added. Page will restart.');
                        location.reload();
                    }
                    else {
                        alert(`An error occured: ${data?.message}`);
                    }
                });
        });
        $("div.overlay-3").show();
    });

    $("a.cancel-send").click(() => {
        $("#message").val("");
    });

    $("a.button.post-send").click(() => {
        let message = $("#message").val();
        let duration = 7;
        let audience = parseInt($('#post_classes_selected').attr('select_id'));
        let expiry = new Date();
        expiry.setDate(new Date().getDate() + duration);
        let datePosted = new Date();

        let requestBody = {
            message: message,
            expiry: expiry.toISOString().replace('Z', ''),
            classId: audience,
            posted: datePosted.toISOString().replace('Z', '')
        };

        $.post('/newpost', requestBody)
            .done(data => {
                if (data?.success) {
                    location.reload();
                }
                else {
                    alert('An error occured: ' + data.message);
                }
            });
    });

    $("a.button[name='day']").removeAttr("href");
    $("a.button[name='limit']").removeAttr("href");
    $("a[href='#']").removeAttr("href");

    $("a.button[name='limit']").click(e => {
        let clickedText = e.target.text;
        let lim = parseInt(clickedText) * (clickedText.includes("hour") ? 60 : 1);
        $(".limits").attr("limit", lim);
        $("a.button[name='limit']").removeClass("btn-pressed");
        e.target.classList.add("btn-pressed");
    });

    $("a.button.account").click(e => {
        let fordate = new Date(new Date($("input[name='date']").val()).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 23);
        let expiry = new Date(new Date($("input[name='date']").val()).getTime() - (new Date().getTimezoneOffset() * 60000) + (parseInt($(".limits").attr("limit")) * 60000)).toISOString().substr(0, 23);
        let classId = location.href.split("#")[1].split("-")[1];

        let requestBody = {
            dateposted: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 23),
            classId: classId,
            expiry: expiry,
            fordate: fordate
        };

        $.post('newattendance', requestBody)
            .done(data => {
                if(data?.success){
                    $(".overlay-4").hide();
                    $(".loading-overlay").show();
                    location.reload();
                }
                else{
                    alert("An error occured: " + data?.message);
                }
            });
    });

    $.getJSON('posts', data => {
        console.log(data);
        if (data?.success) {
            if (data?.result.length > 0) {
                $("#teacher-no-announcement").hide();
                $("#teacher-yes-announcement").show();
                $("#teacher-yes-announcement").html("");

                let postsBuilder = '';
                data?.result.forEach(post => {
                    let postId = post.post_id;
                    let grade = post.grade;
                    let section = post.section;
                    let teacher = post.teacher;
                    let message = post.message;
                    let posted = convertToUXDate(new Date(post.dateposted));
                    const postHTML =
                        `<div class="m-content">
                        <div class="content-top">
                            <div class="content-detail">
                                <img src="images/profile.png" alt="profile">
                                <div class="from">
                                    <p class="gra-sec"><span class="gra">${grade == null ? "All Grades" : grade}</span> - <span class="sec">${section == null ? "All Sections" : section}</span></p>
                                    <p class="teach">${teacher}</p>
                                </div>
                            </div>
                            <div class="dropdown">
                                <a href="#"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>
                                <div class="dropdown-content" style="right: 0; width: 9.3125rem; top: 0; margin: 0 0.625rem 0 0;">
                                    <a href="#post-${post.post_id}">Edit</a>
                                    <a href="deletepost?postId=${post.post_id}">Delete</a>
                                </div>
                            </div>
                        </div>
                        <div class="content-mid">
                            <p class="message">${message.replace('\n', '<br>')}</p>
                        </div>
                        <p class="when">${posted}</p>
                    </div>`;
                    postsBuilder += postHTML;
                });

                $("#teacher-yes-announcement").html(postsBuilder);
            }
            else {
                $("#teacher-no-announcement").show();
                $("#teacher-yes-announcement").hide();
            }
        }
    });

    $.getJSON('attendances', data => {
        if (data.success) {
            let classesBuilder = '';
            $('#post_classes_selected').text("All Classes");
            $('#post_classes_selected').attr("select_id", 0);
            let postClassesBuilder = `<a href="#" onclick="$('#post_classes_selected').text('All Classes');$('#post_classes_selected').attr('select_id', 0)">All Classes</a>`;
            data?.result.forEach((classData) => {
                let hasActiveAttendance = classData?.attdate != null;
                let classId = classData?.class_id;
                let grade = classData?.grade;
                let section = classData?.section;
                let subject = classData?.subject;
                let code = classData?.code;
                let date = convertToUXDate(new Date(classData?.attdate));
                let expiry = new Date(classData?.expiry);

                console.log(classData);

                const postClassHTML = `<a href="#" onclick="$('#post_classes_selected').text('${grade + "-" + section}'); $('#post_classes_selected').attr('select_id', ${classId});">${grade + "-" + section}</a>`;
                postClassesBuilder += postClassHTML;
                const classHTML =
                    `<div class="section-base" id="class_${classId}">
                    <div class="section no-attendance">
                        <div class="section-top">
                            <div class="dropdown">
                                <a href="#"><i class="fa fa-cog" aria-hidden="true"></i></a>
                                <div class="dropdown-content" style="left: 0; top: 0; width: 9.3125rem;">
                                    <a href="#resetclass-${classId}">Reset Progress</a>
                                    <a href="#removeclass-${classId}">Remove from Class</a>
                                </div>
                            </div>
                            <img src="images/profile.png" alt="profile">
                        </div>
                        <div class="section-btm">
                            <div class="main">
                                <p class="main-sec">${grade}-${section}</p>
                                <p class="main-sub">${subject}</p>
                                <p class="main-code"><strong>Code:</strong> <span>${code}</span></p>
                            </div>
                            <div class="attend ${hasActiveAttendance ? '' : 'inactive'}">
                                <p class="attendance"><strong>Attendance for:</strong> <span class="date">${date}</span></p>
                                <p class="limit"><strong>Time left:</strong> <span class="time" id="expiry_${classId}">${convertToUXDate(expiry)}</span>
                                </p>
                            </div>
                            <div class="btns">
                                <div class="btns-left">
                                    <a href="cancelattendance?classId=${classId}" class="cancel  ${hasActiveAttendance ? '' : 'inactive'}">cancel attendance</a>
                                </div>
                                <div class="btns-right">
                                    <a href="class-record.html?class=${classId}" class="view">view</a>
                                    <a href="#attendance-${classId}" class="button add  ${hasActiveAttendance ? 'inactive' : ''}">add attendance</a>
                                    <a class="button edit  ${hasActiveAttendance ? '' : 'inactive'}">edit</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                classesBuilder += classHTML;
                setInterval(() => {
                    $(`#expiry_${classId}`).text(getRemainingTime(expiry));
                },
                    1000);
            });
            $("#teacher-no-class").hide();
            $("#teacher-yes-class").show();
            $("#teacher-yes-class").children().first().html(classesBuilder);
            $("#post_classes_dropdown").html(postClassesBuilder);
            $(".button.add").click(() => {
                $("i.fas.fa.fa-times").attr("href", "#");
                $(".button.back").attr("href", "#");
                $("i.fas.fa.fa-times").click(() => {
                    $("div.overlay-4").hide();
                });
                $(".button.back").click(() => {
                    $(".overlay-4").hide();
                });
                $("input[name='date']").val(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 16));
                $(".overlay-4").show();
            });
        }
    });


};