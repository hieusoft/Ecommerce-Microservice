/** State service for managing flow and step in Redis. */
import { getUserContext, setUserContext, deleteUserContext } from '../core/redis.js';

export class StateService {

  static async getState(userId) {
    const context = await getUserContext(userId);
    if (context) {
      return {
        flow: context.flow || null,
        step: context.step || null,
        data: context.data || {}
      };
    }
    return { flow: null, step: null, data: {} };
  }


  static async setState(userId, flow = null, step = null, data = {}) {
    const context = {
      flow: flow,
      step: step,
      data: data
    };
    await setUserContext(userId, context, 3600);
  }

  
  static async updateStep(userId, step) {
    const context = await getUserContext(userId);
    if (context) {
      context.step = step;
      await setUserContext(userId, context, 3600);
    }
  }


  static async updateData(userId, key, value) {
    const context = await getUserContext(userId);
    if (context) {
      context.data = context.data || {};
      context.data[key] = value;
      await setUserContext(userId, context, 3600);
    }
  }

  static async clearState(userId) {
    await deleteUserContext(userId);
  }
}


