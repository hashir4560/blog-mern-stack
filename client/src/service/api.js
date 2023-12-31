import axios from "axios";
import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from "../constants/config";

const API_URL = "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "content-type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    //Stop Gloal Loader Here
    return processResponse(response);
  },
  function (error) {
    //Stop Gloal Loader Here
    return Promise.reject(processError(error));
  }
);

/////////////////////
// if success --> return {isSuccess:true,data:Object}
// if fail --> return {isFailure:true,status:String,code:int }

const processResponse = (response) => {
  if (response?.status === 200) {
    return { isSuccess: true, data: response.data };
  } else {
    return {
      isFailure: true,
      status: response?.status,
      msg: response?.msg,
      code: response?.code,
    };
  }
};

/////////////////////
// if success --> return {isSuccess:true,data:Object}
// if fail --> return {isFailure:true,status:String,code:int }

const processError = (error) => {
  if (error.response) {
    //Request made and server respnded with a status other that falls out of range of 2.x.x
    console.log("ERROR IN RESPONSE:", {
      response: error.response,
      request: error.request,
      toJSON: error.toJSON(),
    });
  } else if (error.request) {
    // Request made but there is no response  came
    console.log("ERROR IN REQUEST:", error.toJSON());
    return {
      isError: true,
      msg: API_NOTIFICATION_MESSAGES.responseFailure.message,
      code: "",
    };
  } else {
    // Something happened in Setting up request that triggers an  error
    console.log("ERROR IN NETWORK:", error.toJSON());
    return {
      isError: true,
      msg: API_NOTIFICATION_MESSAGES.networkError,
      code: "",
    };
  }
};

const API = {};
for (const [key, value] of Object.entries(SERVICE_URLS)) {
  API[key] = (body, showUploadProgress, showDownloadProgress) =>
    axiosInstance({
      method: value.method,
      url: value.url,
      data: body,
      responseType: value.responseType,
      onUploadProgress: function (progressEvent) {
        if (showUploadProgress) {
          let percentageCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          showUploadProgress(percentageCompleted);
        }
      },
      onDownloadProgress: function (progressEvent) {
        if (showDownloadProgress) {
          let percentageCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          showDownloadProgress(percentageCompleted);
        }
      },
    });
}

export { API };
