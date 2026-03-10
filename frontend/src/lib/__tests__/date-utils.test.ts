import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatDateSimple } from "../date-utils";

describe("formatDate", () => {
  it("returns 'No date' for null", () => {
    expect(formatDate(null)).toBe("No date");
  });

  it("formats a valid date string with weekday and time", () => {
    const result = formatDate("2025-01-15T14:30:00Z");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });
});

describe("formatDateTime", () => {
  it("returns 'No date' for null", () => {
    expect(formatDateTime(null)).toBe("No date");
  });

  it("formats a valid date string without weekday", () => {
    const result = formatDateTime("2025-06-20T10:00:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("20");
    expect(result).toContain("2025");
  });
});

describe("formatDateSimple", () => {
  it("returns 'No date' for null", () => {
    expect(formatDateSimple(null)).toBe("No date");
  });

  it("formats date without time", () => {
    const result = formatDateSimple("2025-03-15T12:00:00Z");
    expect(result).toContain("Mar");
    expect(result).toContain("2025");
  });
});
