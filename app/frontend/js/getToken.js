const TOKEN_NAME = "token"

function getToken(){
    return localStorage.getItem(TOKEN_NAME) ?? ""
}

function getTokenHeader(){
    return { "Authorization" : `Bearer ${getToken()}`}
}

function setToken(token){
    return localStorage.setItem(TOKEN_NAME, token)
}