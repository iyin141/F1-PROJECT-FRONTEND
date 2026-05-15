import type { NextRequest } from "next/server";
import { handleProxyRequest } from "@/Lib/proxy/handler";

export const dynamic = "force-dynamic";

// Wrap the core handler with method exports that match Next's expected
// route handler signatures so the dev-type validator can type-check.
export const GET = (request: NextRequest, context: { params: Promise<{ slug?: string[] | undefined }> }) =>
	handleProxyRequest(request as unknown as Request, context as unknown as PromiseLike<unknown>);

export const POST = (request: NextRequest, context: { params: Promise<{ slug?: string[] | undefined }> }) =>
	handleProxyRequest(request as unknown as Request, context as unknown as PromiseLike<unknown>);

export const PUT = (request: NextRequest, context: { params: Promise<{ slug?: string[] | undefined }> }) =>
	handleProxyRequest(request as unknown as Request, context as unknown as PromiseLike<unknown>);

export const PATCH = (request: NextRequest, context: { params: Promise<{ slug?: string[] | undefined }> }) =>
	handleProxyRequest(request as unknown as Request, context as unknown as PromiseLike<unknown>);

export const DELETE = (request: NextRequest, context: { params: Promise<{ slug?: string[] | undefined }> }) =>
	handleProxyRequest(request as unknown as Request, context as unknown as PromiseLike<unknown>);

export const OPTIONS = (request: NextRequest, context: { params: Promise<{ slug?: string[] | undefined }> }) =>
	handleProxyRequest(request as unknown as Request, context as unknown as PromiseLike<unknown>);

export const HEAD = (request: NextRequest, context: { params: Promise<{ slug?: string[] | undefined }> }) =>
	handleProxyRequest(request as unknown as Request, context as unknown as PromiseLike<unknown>);
