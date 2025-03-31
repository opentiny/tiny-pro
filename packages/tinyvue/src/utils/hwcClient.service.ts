import { HwcClient } from '@opentiny/hwc-client';
import { ApigInfo } from '@/types/global';
import BaseUtils from '@/utils/base-utils';

export class HwcClientService {
  static async apiRequest(fnName: string, params: any, apigInfo: ApigInfo) {
    return HwcClient.apigClient
      .exec(apigInfo.apigGroupName, apigInfo.apigName, {
        query: { fn_name: fnName },
        body: JSON.stringify(params),
      })
      .then((rep) => {
        if (rep.ok) {
          return rep;
        }
        throw new Error();
      })
      .then((rep) => rep.json())
      .then((rep) => (rep.error_code ? { data: [] } : rep))
      .catch((err) => {
        return { data: [] };
      });
  }
}
