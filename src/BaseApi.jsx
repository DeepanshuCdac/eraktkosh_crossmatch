const getSSOTicketVar = () => {
  console.log("Extracting SSO Ticket:");
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  const varSSOTicketGrantingTicket = urlParams.get(
    "varSSOTicketGrantingTicket"
  );

  if (varSSOTicketGrantingTicket) {
    const currentTicket = sessionStorage.getItem("grantingTcn");

    if (currentTicket !== varSSOTicketGrantingTicket) {
      console.log(
        "Updating session storage with new SSO Ticket:",
        varSSOTicketGrantingTicket
      );
      sessionStorage.setItem("grantingTcn", varSSOTicketGrantingTicket);
    }
  } else {
    console.log("No SSO ticket found in the URL.");
  }
};

getSSOTicketVar();

const getUserAgent = () => {
  return navigator.userAgent;
};

const currentUrl = window.location.href;
console.log("Current URL:", currentUrl);

const urlObject = new URL(currentUrl);
const dynamicBaseURL = urlObject.port
  ? `${urlObject.protocol}//${urlObject.hostname}:${urlObject.port}`
  : `${urlObject.protocol}//${urlObject.hostname}`;

export const baseURL = "http://10.10.10.96:8080/AiimsBloodBank";
// export const baseURL = "http://10.226.30.41:8080";
export const SSoToken =
  "152.251.44.181.113.3.28.243.130.208.145.134.171.32.37.167.201.22.212.75.197.229.14.225.43.231.33.40.218.79.215.47.222.27.55.156.50.14.134.68.192.136.9.19.110.193.3.219";
export const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";

// export const baseURL = dynamicBaseURL+"/AiimsBloodBank";
// export const SSoToken = sessionStorage.getItem("grantingTcn");
// export const userAgent = getUserAgent();

console.log("Dynamic Base URL:", baseURL);
console.log("User Agent:", userAgent);
console.log("Token for Access:", SSoToken);
