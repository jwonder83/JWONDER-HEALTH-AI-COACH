/** PortOne(구 아임포트) v1 JS — https://cdn.iamport.kr/v1/iamport.js */

export type IamportPaymentResponse = {
  success: boolean;
  error_msg?: string;
  imp_uid?: string;
  merchant_uid?: string;
  paid_amount?: number;
};

export type IamportRequestPayParams = {
  pg: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email: string;
  buyer_name: string;
  /** KG이니시스 등에서 누락 시 오류가 나는 경우가 많음 */
  buyer_tel?: string;
  m_redirect_url?: string;
};

export type IamportInstance = {
  init: (impCode: string) => void;
  request_pay: (params: IamportRequestPayParams, callback: (rsp: IamportPaymentResponse) => void) => void;
};

declare global {
  interface Window {
    IMP?: IamportInstance;
  }
}

export {};
