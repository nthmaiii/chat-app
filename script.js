


import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
const firebaseConfig = {
  apiKey: "AIzaSyCAgxgKgzZrybj-atFMWYdwxNGtJCmKVVM",
  authDomain: "chat-app-fae32.firebaseapp.com",
  projectId: "chat-app-fae32",
  storageBucket: "chat-app-fae32.firebasestorage.app",
  messagingSenderId: "30568603866",
  appId: "1:30568603866:web:6ac74bae8cb79b0c7e45e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//khởi tạo auth
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
const auth = getAuth();

// khởi tạo realtime
import { getDatabase, ref, push, set, onChildAdded, child, get, onChildRemoved, remove  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
const db = getDatabase();
const dbRef = ref(getDatabase());



// Hiển thị thông báo
const showAlert = (content, time = 3000) => {
    if(content)
    {
      const div = document.createElement("div");
      div.setAttribute("class", "alert alert--access");
      div.innerHTML = 
        `<div class="alert__content">${content}</div>
        <div class="alert__close"><i class="fa-solid fa-xmark"></i></div>`;
      const alertList = document.querySelector(".alert-list");
      alertList.appendChild(div);
      //ấn x thì xóa
      const alertClose = alertList.querySelector(".alert__close");
      alertClose.addEventListener("click", () => {
        alertList.removeChild(div);
      });
      //5s thì ẩn
      setTimeout(() => {
        alertList.removeChild(div);
      }, time)
    }
  };
  // Hết phần hiển thị thông báo

//kiêm tra tồn tại form hay không, nếu có lấy ra thông tin
const formSignin = document.querySelector("#form-register");
if(formSignin)
{
    //lấy ra thông tin
    formSignin.addEventListener("submit", (even) => {
        even.preventDefault();
        const name = formSignin.fullName.value;
        const email = formSignin.email.value;
        const password = formSignin.password.value;
        //kiểm tra email nhập vào có đúng định dạng sử dụng regex
        const regexCheckEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
        //kiểm tra liệu mật khẩu có đủ mạnh
        const regexCheckPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/gi;
        if (!regexCheckEmail.test(email)) {
          showAlert("Email chưa đúng định dạng!");
          formSignin.email.value = "";
        } else if (!regexCheckPass.test(password)) {
          showAlert("Mật khẩu chưa đủ mạnh!");
          formSignin.password.value = "";
        } else if(email && password && name){
          // Lưu vào auth chuyển hướng sang trang chủ và realtime database
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              //lưu lại thông tin
              const user = userCredential.user;
              if(user) {
                set(ref(db, 'users/' + user.uid), {
                  fullName: name,
                }).then(() => {
                  // Data saved successfully!
                  formSignin.fullName.value = "";
                  formSignin.email.value = "";
                  formSignin.password.value = "";
                  window.location.href = "index.html";
                })
                .catch((error) => {
                });
              }
              
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              showAlert("Email đã tồn tại trong hệ thống!");
              formSignin.email.value = "";
            });
            
        }
    })
}

// Tính năng đăng nhập
const formLogin = document.querySelector("#form-login");
if(formLogin)
{
  //lấy ra thông tin
  formLogin.addEventListener("submit", (even) => {
      even.preventDefault();
      const email = formLogin.email.value;
      const password = formLogin.password.value;
      if(email && password) {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            window.location.href = "index.html";
          })
          .catch((error) => {
            showAlert("Email hoặc mật khẩu chưa đúng!");
          });
      }
  })
}


// Đăng xuất 
const formLogout = document.querySelector("[button-logout]");
if(formLogout)
{
  formLogout.addEventListener("click", () => {
    //lấy ra thông tin
    signOut(auth).then(() => {
      // Sign-out successful.
      window.location.href = "login.html";
    }).catch((error) => {
      // An error happened.
    });
  })
  
}


// Kiểm tra trạng thái đăng nhập
const buttonsignin = document.querySelector("[button-login]");
const buttonlogin = document.querySelector("[button-register]");
const buttonlogout = document.querySelector("[button-logout]");
const chat = document.querySelector("[chat]")
const Emoji = document.querySelector("emoji-picker");

onAuthStateChanged(auth, (user) => {
  if (user) {
    buttonlogout.style.display = "flex";
    //lấy ra avatar để đổi
    const postId = auth.currentUser.uid;
    const commentsRef = ref(db, 'users/' + postId);
    const innerActions= document.querySelector(".inner-actions");
    onChildAdded(commentsRef, (data) => {
      const button = document.createElement("button");
      button.setAttribute("class", "avatar");
      button.innerHTML = data.val()[0];
      innerActions.appendChild(button);
    });
    chat.style.display = "block";
    // console.log("Đã đăng nhập")
  } else {
    buttonlogin.style.display = "inline-block";
    buttonsignin.style.display = "inline-block";
    if(chat)
    {
        chat.remove();
    }
    // tại sao không dùng display: none -> nhỡ ngta f12 lên rồi sửa style thì sao
    // console.log("Chưa đăng nhập")
  }
});


// Form chat
const formChat = document.querySelector("[chat] .inner-form");
if(formChat)
{
  formChat.addEventListener("submit", (even) => {
    even.preventDefault();
    const content = formChat.content.value;
    //lưu vào cơ sở dữ liệu
    const userID = auth.currentUser.uid;
    if(content && userID) {
      set(push(ref(db, "chats")), {
        content: content,
        userID: userID
      });
      formChat.content.value = "";
    }
  })
}
// End Form chat


// Hiển thị tin nhắn mặc định
const chatsRef = ref(db, 'chats');

const chatBody  = document.querySelector("[chat] .inner-body");
if(chatBody)
{
  
  onChildAdded(chatsRef, (data) => {
    //console.log(data.key, data.val());
    //mỗi khi 1 thằng mới đc thêm vào giao diên -> vẽ lên giao diện
    const div = document.createElement("div");
    get(child(dbRef, `users/${data.val().userID}`)).then((snapshot) => {
      //chọc vào tìm fullname
      if (snapshot.exists()) {
        if(auth.currentUser.uid === data.val().userID)
        {
          div.setAttribute("userID", `${data.key}`);
          div.setAttribute("class", "inner-outgoing");
          div.innerHTML = 
            `<div class="inner-content">
              ${data.val().content}
            </div>
            <button class="button-delete" uid="${data.key}" >
              <i class="fa-regular fa-trash-can"></i> 
            </button>
            `;
            chatBody.insertBefore(div, Emoji);
            chatBody.scrollTop = chatBody.scrollHeight;
            // Vẽ ra rồi -> Ktra tồn tại nút xóa, rồi xóa
            const buttonDelete = document.querySelectorAll(".button-delete");
            buttonDelete.forEach((item) => {
              item.addEventListener("click", () => {
                const key = item.getAttribute("uid");
                // Xóa trong firebase
                const chatsRef = ref(db, 'chats/' + key);
                remove(chatsRef).then(() => {
                  //không realtime nên chỉ xóa trên giao diệm thằng chủ, còn bọn kia phải load lại để vẽ lại thì mới mất
                });
              })
            })
        }
        else {
          div.setAttribute("class", "inner-incoming");
          div.setAttribute("userID", `${data.key}`);
          div.innerHTML = 
            `<div class="inner-name">
              ${snapshot.val().fullName}
            </div>
            <div class="inner-content">
              ${data.val().content}
            </div>`;
            chatBody.insertBefore(div, Emoji);
            //muốn khi vẽ ra thanh scroll  luôn cuộn xuống bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        }
      } else {
        // console.log("No data available");
      }
    }).catch((error) => {
      // console.error(error);
    });
  });
  
}
// End Hiển thị tin nhắn mặc định


// Nếu một tin nhắn đc xóa thì xóa trên giao diện 

onChildRemoved(chatsRef, (data) => {
  //console.log(data.key);
  const deleteMes = document.querySelector(`[userID="${data.key}"]`);
  deleteMes.remove();
});
// End Nếu một tin nhắn đc xóa thì xóa trên giao diện 



// emoji picker element
if(Emoji)
{
  document.querySelector('emoji-picker')
  .addEventListener('emoji-click', event =>  {
    const content = event.detail.unicode;
    const formChat = document.querySelector(".chat-app form");
    formChat.content.value += content;
  });
}

//khai nào click mới hiện
const buttonIcon = document.querySelector(".button-icon");
if(buttonIcon)
{
  buttonIcon.addEventListener("click", (event) => {
    Emoji.classList.toggle("display");
  })
}

//ấn ra ngoài cũng mất
if(Emoji)
{
  document.addEventListener("click", (event) => {
    // Nếu không click vào emojiMenu hoặc emojiIcon, và menu đang hiển thị
    if (!Emoji.contains(event.target) && !buttonIcon.contains(event.target) && Emoji.classList.contains("display") ) {
      Emoji.classList.remove("display");
    }
  });
}
// End emoji picker element
