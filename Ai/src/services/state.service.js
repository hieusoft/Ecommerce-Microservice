/** State service for managing flow and step in Redis */
import {
  getUserContext,
  setUserContext,
  deleteUserContext
} from '../core/redis.js';

const TTL = 3600;

export class StateService {

  static async getState(userId) {
    const context = await getUserContext(userId);

    return {
      flow: context?.flow ?? null,
      step: context?.step ?? null,
      data: context?.data ?? {}
    };
  }

  /**
   * Reset or initialize state
   * Use when switching flow
   */
  static async setState(userId, flow = null, step = null, data = {}) {
    await setUserContext(
      userId,
      { flow, step, data },
      TTL
    );
  }

  /**
   * Update only step, keep flow & data
   */
  static async updateStep(userId, step) {
    const context = (await getUserContext(userId)) || {};
    await setUserContext(
      userId,
      {
        ...context,
        step
      },
      TTL
    );
  }

  /**
   * Update a single data field
   */
  static async updateData(userId, key, value) {
    const context = (await getUserContext(userId)) || {};
    await setUserContext(
      userId,
      {
        ...context,
        data: {
          ...(context.data || {}),
          [key]: value
        }
      },
      TTL
    );
  }

  /**
   * Clear entire state (end flow)
   */
  static async clearState(userId) {
    await deleteUserContext(userId);
  }
}
