
import Router from "next/router";
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import axios, { AxiosError } from "axios";
import { ErrorRes, SuccessRes } from "@/types/core";
import { toast } from "sonner";
import queryClient from "@/lib/queryClient";
import { Message } from "ai";








export async function sendFn(data: Message[] ) {
  return (await axios.post("/api/chat", data)).data;
}
const Chat = {

  SendMessage: {
    useMutation: (
      options?: UseMutationOptions<
        Message[],
        AxiosError<ErrorRes>,
        Message[]
      >
    ) =>
      useMutation({
        ...options,
        mutationFn: (data) => sendFn(data),
        onSuccess: (data) => {
          toast("message recived");
        },
        onError: (error) => {
          
          toast(error.response?.data.message as string);
        },
        onMutate: (variables) => {
          toast("Please wait");
        },
      }),
  }

};

export default Chat;



