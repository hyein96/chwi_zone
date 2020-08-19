let gauth;
const xhr = new XMLHttpRequest();
let loginBtn = document.querySelector('.button');
loginBtn.addEventListener('click', login);

function login() {
    gapi.load('auth2', function () {
        gauth = gapi.auth2.init({
            client_id: '323175054347-2opv5viepsbbh21foitrcit5qvfdh5is.apps.googleusercontent.com',
            fetch_basic_profile: false,
            scope: 'https://www.googleapis.com/auth/youtube'
        });
  
        gauth.signIn().then(result => {
            let user = gauth.currentUser.get();
            let userName = user.getBasicProfile().getName();
            let id_token = result.getAuthResponse().id_token;
            let access_token = result.getAuthResponse(true).access_token;
  
            xhr.open('post', 'http://localhost:3000/account/googlesigncallback', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        let payload = JSON.parse(xhr.responseText);
                        window.location.href = './next.html';
                        localStorage.setItem('token', payload.token);
                        localStorage.setItem('name', userName)
                    } else {
                        console.error(xhr.responseText);
                    }
                }
            };
            xhr.send("id_token=" + id_token + "&access_token=" + access_token);
        });
    });
  }
        