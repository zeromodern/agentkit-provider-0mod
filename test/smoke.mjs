#!/usr/bin/env node
/**
 * Dependency-light smoke test for @zeromodern/agentkit-provider-0mod.
 *
 * Imports the BUILT entry (build/index.js — the file the `main`/`exports` point
 * at) and asserts the decorated action surface. ActionKit registers each
 * `@CreateAction` method into constructor metadata via reflect-metadata, so the
 * test asserts against `getActions()` rather than source text. Count must be 10,
 * matching the 10 live `/api/v1/*` routes in the gateway discovery document;
 * a drift here means an action was added/removed without a matching route.
 */
import assert from "node:assert";
import { ZeroModActionProvider, zeroModActionProvider } from "../build/index.js";

const provider = new ZeroModActionProvider();
assert.ok(provider instanceof ZeroModActionProvider, "unexpected provider shape");

const actions = provider.getActions(undefined);
assert.strictEqual(actions.length, 10, `expected 10 agentkit actions, got ${actions.length}`);

const names = actions.map((a) => a.name).sort();
console.log("smoke: agentkit-provider-0mod actions =", actions.length);
console.log("smoke: action names =", names.join(", "));

// The exported factory must also build a working provider.
assert.strictEqual(zeroModActionProvider().getActions(undefined).length, 10, "factory mismatch");
console.log("SMOKE PASS: @zeromodern/agentkit-provider-0mod");
