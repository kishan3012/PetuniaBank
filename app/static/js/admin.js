document.addEventListener("DOMContentLoaded", () => {
  const userTableDiv = document.getElementById("userTable")
  const searchBar = document.getElementById("searchBar")
  
  function updateTable(userArray) {
    userTableDiv.innerHTML = `
      <div class="info-box">
        <div class="table-responsive">
          <table class="table table-striped table-dark table-hover mb-0">
            <thead>
              <tr>
                <th scope="col">OAuth ID</th>
                <th scope="col">Nickname</th>
                <th scope="col">Role</th>
                <th scope="col">Balance</th>
                <th scope="col">Prelievi Giornalieri (${new Date().toLocaleDateString("it-IT")})</th>
              </tr>
            </thead>
            <tbody>
              ${userArray.map(user => `
                <tr ${user.isYou ? 'class="fw-bold"' : ""}>
                  <td>${user.oauthID}</td>
                  <td>${user.nickname}</td>
                  <td ${tRole = user.role.split("-")}><span class="badge rounded-pill text-bg-${tRole[0]}">${tRole[1]}</span></td>
                  <td>${user.balance} €</td>
                  <td>${user.dailyWithdraws} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `

  }
  
  let users = []


  searchBar.addEventListener('input', () => {
    const searchValue = searchBar.value.toLowerCase()
    const filtered = users.filter(user => user.nickname.toLowerCase().replace(" ", "").includes(searchValue))
    updateTable(filtered)
  })


  fetch("admin/view").then(r => r.json()) .then(r => {
    if(r["success"]){
      users = r["usersInfo"]
      updateTable(users)
    }
  })
  
})