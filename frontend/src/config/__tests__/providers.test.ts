import { describe, it, expect } from "vitest";
import {
  getProviderFromModelName,
  getProviderConfig,
  DEFAULT_PROVIDER_CONFIG,
} from "../providers";

describe("getProviderFromModelName", () => {
  it("identifies Google models", () => {
    expect(getProviderFromModelName("google/gemini-2.5-pro")).toBe("google");
  });

  it("identifies Anthropic models", () => {
    expect(getProviderFromModelName("anthropic/claude-opus-4-6")).toBe("anthropic");
  });

  it("identifies agent-prefixed models", () => {
    expect(getProviderFromModelName("agent-google/gemini-2.5-flash")).toBe("google");
    expect(getProviderFromModelName("agent-anthropic/claude-sonnet-4-6")).toBe("anthropic");
    expect(getProviderFromModelName("agent-x-ai/grok-3")).toBe("xai");
    expect(getProviderFromModelName("agent-deepseek/deepseek-r1")).toBe("deepseek");
  });

  it("returns empty string for unknown models", () => {
    expect(getProviderFromModelName("unknown-model")).toBe("");
  });
});

describe("getProviderConfig", () => {
  it("returns config for known providers", () => {
    const config = getProviderConfig("openai");
    expect(config).not.toBeNull();
    expect(config!.displayName).toBe("OpenAI");
  });

  it("normalizes provider names", () => {
    const config = getProviderConfig("Mistral AI");
    expect(config).not.toBeNull();
    expect(config!.displayName).toBe("Mistral AI");
  });

  it("returns null for unknown providers", () => {
    expect(getProviderConfig("nonexistent")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getProviderConfig("")).toBeNull();
  });
});

describe("DEFAULT_PROVIDER_CONFIG", () => {
  it("has gray color", () => {
    expect(DEFAULT_PROVIDER_CONFIG.color).toBe("#6B7280");
  });
});
