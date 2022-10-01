import { Swap } from "@airswap/libraries";
import { fetchTokens } from "@airswap/metadata";
import * as SwapContract from "@airswap/swap/build/contracts/Swap.sol/Swap.json";
// @ts-ignore
import * as swapDeploys from "@airswap/swap/deploys";
import { FullOrder } from "@airswap/typescript";
import {
  decompressFullOrder,
  getSignerFromSwapSignature,
  isValidFullOrder,
  orderPropsToStrings,
} from "@airswap/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { error } from "console";
import { ethers, utils, Contract } from "ethers";

import {
  notifyRejectedByUserError,
  notifyError,
  notifyTransaction,
  notifyConfirmation,
} from "../../components/Toasts/ToastController";
import { isAppError, AppErrorType } from "../../errors/appError";
import { removeUserOrder } from "../myOrders/myOrdersSlice";
import { reset, setActiveOrder, setStatus, setErrors } from "./takeOtcSlice";

const SwapInterface = new utils.Interface(JSON.stringify(SwapContract.abi));

export const decompressAndSetActiveOrder = createAsyncThunk(
  "take-otc/decompressAndSetActiveOrder",
  async (params: { compressedOrder: string }, { dispatch }) => {
    dispatch(reset());

    try {
      const order = decompressFullOrder(params.compressedOrder);

      if (!isValidFullOrder(order)) {
        return dispatch(setStatus("not-found"));
      }

      dispatch(setActiveOrder(order));
      dispatch(setStatus("open"));
    } catch (e) {
      console.error(e);
      dispatch(setStatus("not-found"));
    }
  }
);

export const takeOtcOrder = createAsyncThunk(
  "take-otc/takeOtcOrder",
  async (
    params: {
      chainId: number;
      order: FullOrder;
      library: ethers.providers.Web3Provider;
    },
    { dispatch }
  ) => {
    console.log(params);

    const errors = await new Swap(params.chainId).check(
      params.order,
      params.order.senderWallet,
      params.library.getSigner()
    );

    console.log(errors);

    const signerWallet = getSignerFromSwapSignature(
      params.order,
      swapDeploys[params.chainId],
      params.chainId,
      params.order.v,
      params.order.r,
      params.order.s
    );

    console.log(signerWallet);

    // @ts-ignore
    const swap = await new Swap(params.chainId, params.library).swap(
      params.order,
      params.library.getSigner()
    );

    console.log(swap);
  }
);

export const cancelOrder = createAsyncThunk(
  "take-otc/cancelOrder",
  async (
    params: {
      order: FullOrder;
      chainId: number;
      library: ethers.providers.Web3Provider;
    },
    { dispatch }
  ) => {
    const SwapContract = new Contract(
      swapDeploys[params.chainId],
      SwapInterface,
      params.library.getSigner()
    );

    const _nonceTx = await SwapContract.nonceUsed(
      params.order.signerWallet,
      params.order.nonce
    );

    if (params.chainId.toString() !== params.order.chainId) {
      notifyError({
        heading: "Wrong chain",
        cta: "Switch to correct chain",
      });
      return false;
    }

    if (_nonceTx) {
      notifyError({
        heading: "Unable to cancel",
        cta: "Order has already been canceled or taken",
      });
      return false;
    }

    await SwapContract.cancel([params.order.nonce]);

    const nonceTx = await SwapContract.nonceUsed(
      params.order.signerWallet,
      params.order.nonce
    );

    if (nonceTx) {
      setStatus("taken");
      dispatch(removeUserOrder(params.order));

      notifyConfirmation({
        heading: "Canceled",
        cta: "Your order has been succesfully canceled",
      });
    }
  }
);
