import { v4 as uuid } from "uuid";
const { FRONTEND_BASEURL } = process.env;

export const registration = ({ token, username, email }) => {
  const link = `${FRONTEND_BASEURL}/auth/verify?token=${token}`;

  return {
    text: `Dear ${username}, Your registration on custodial wallet is successful. your token is ${token}`,
    html: `
      <p>
        Dear ${username},
        <span style="display: none !important">${uuid()}</span>
      </p>
      Your registration on custodial wallet is successful.<br>
      <span style="display: none !important">${uuid()}</span>
      <p>
        To verify to your email click here <a href="${link}">${link}</a>
        <span style="display: none !important">${uuid()}</span>
      </p>
      <p>
        Clicking this link will securely verify your account on my https://mycustodialwallet.herokuapp.com using ${email}
        <span style="display: none !important">${uuid()}</span>
      </p>
      <span style="display: none !important">${uuid()}</span>
    `,
  };
};

export const verifyEmail = ({ token, username, email }) => {
  const link = `${FRONTEND_BASEURL}/auth/verify?=token=${token}`;

  return {
    text: `Dear ${username}, You requested to verify your email on custodial wallet. To verify to your email click here ${link}. Clicking this link will securely verify your account on my https://mycustodialwallet.herokuapp.com using ${email}`,
    html: `
      <p>
        Dear ${username},
        <span style="display: none !important">${uuid()}</span>
      </p>
        You requested to verify your email on custodial wallet.<br>
      <p>
        To verify to your email click here <a href="${link}">${link}</a>
        <span style="display: none !important">${uuid()}</span>
      </p>
      <p>
        Clicking this link will securely verify your account on my https://mycustodialwallet.herokuapp.com using ${email}
        <span style="display: none !important">${uuid()}</span>
      </p>
      <span style="display: none !important">${uuid()}</span>
    `,
  };
};

export const verifyPhone = ({ token, username }) =>
  `Dear ${username}, Your IghoApp verification code is ${token}`;

export const resetPassword = ({ token, username }) => {
  const link = `${FRONTEND_BASEURL}/forgot-password?token=${token}`;

  return {
    text: `Dear ${username}, You requested to reset your password on custodial wallet. To reset to your password click here ${link}`,
    html: `
    <p>
      Dear ${username},
      <span style="display: none !important">${uuid()}</span>
    </p>
      You requested to reset your password on custodial wallet.<br>
    <p>
      To reset to your password, click here <a href="${link}">${link}</a>
      <span style="display: none !important">${uuid()}</span>
    </p>
    <span style="display: none !important">${uuid()}</span>
    `,
  };
};
