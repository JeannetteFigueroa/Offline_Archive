/* =========================================================
   ACCOUNT.JS

   Carga los datos de la cuenta simulada, muestra el nombre
   de bienvenida y controla el cierre de sesión.
   ========================================================= */

const ACCOUNT_KEY = "offlineArchiveAccount";
const SESSION_KEY = "offlineArchiveSession";

function getStoredSession() {
  const localSession = localStorage.getItem(SESSION_KEY);
  const temporarySession = sessionStorage.getItem(SESSION_KEY);

  try {
    return JSON.parse(localSession || temporarySession || "null");
  } catch {
    return null;
  }
}

function getAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
  } catch {
    return null;
  }
}

function formatBirthDate(value) {
  if (!value) return "No registrada";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

const session = getStoredSession();
const account = getAccount();

if (!session || !account || session.email !== account.email) {
  window.location.href = "login.html";
} else {
  const welcomeName = document.getElementById("welcomeName");
  const accountEmail = document.getElementById("accountEmail");
  const accountBirthDate = document.getElementById("accountBirthDate");
  const accountRegion = document.getElementById("accountRegion");
  const accountCommune = document.getElementById("accountCommune");
  const accountAddress = document.getElementById("accountAddress");

  if (welcomeName) {
    welcomeName.textContent = account.name || "Usuario";
  }

  if (accountEmail) {
    accountEmail.textContent = account.email;
  }

  if (accountBirthDate) {
    accountBirthDate.textContent = formatBirthDate(account.birthDate);
  }

  if (accountRegion) {
    accountRegion.textContent = account.region || "—";
  }

  if (accountCommune) {
    accountCommune.textContent = account.commune || "—";
  }

  if (accountAddress) {
    accountAddress.textContent = account.address || "—";
  }

  const purchaseCount = document.getElementById("purchaseCount");
  if (purchaseCount) {
    purchaseCount.textContent = "0";
  }
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
  });
}
