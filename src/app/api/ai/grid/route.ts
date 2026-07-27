import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.contents?.[0]?.text || body.prompt || "";
    const columns = body.columns || [];

    const commands: any[] = [];
    let message = "I have processed your request.";
    const text = prompt.toLowerCase();

    // Helper to find a column from text
    const findColumn = (searchText: string) => {
      return columns.find((c: any) => {
        const fieldName = String(c.field).toLowerCase();
        const titleName = String(c.title || "").toLowerCase();
        return searchText.includes(fieldName) || searchText.includes(titleName);
      });
    };

    if (text.includes("clear") || text.includes("reset") || text.includes("remove") || text.includes("original")) {
      commands.push({
        type: "clear"
      });
      message = "Cleared all sorting, grouping, and filtering.";
    } else if (text.includes("group")) {
      const col = findColumn(text);
      if (col) {
        commands.push({
          type: "group",
          field: col.field
        });
        message = `Grouped by ${col.title || col.field}.`;
      } else {
        message = "Could not find column to group by.";
      }
    } else if (text.includes("sort") || text.includes("order") || text.includes("arrange") || text.includes("alphabetical")) {
      const dir = text.includes("desc") || text.includes("down") || text.includes("reverse") || text.includes("z to a") ? "desc" : "asc";
      const col = findColumn(text);
      if (col) {
        commands.push({
          type: "sort",
          field: col.field,
          dir: dir
        });
        message = `Sorted by ${col.title || col.field} in ${dir === "desc" ? "descending" : "ascending"} order.`;
      } else {
        message = "Could not find column to sort by.";
      }
    } else {
      // Try to find a filter match based on unique values in columns
      let filterMatched = false;
      for (const col of columns) {
        if (col.values && Array.isArray(col.values)) {
          // Check if prompt contains any of the column's unique values
          const matchedVal = col.values.find((val: any) => {
            if (val === null || val === undefined) return false;
            const strVal = String(val).toLowerCase();
            return text.includes(strVal);
          });

          if (matchedVal !== undefined) {
            commands.push({
              type: "filter",
              field: col.field,
              operator: typeof matchedVal === "number" ? "eq" : "contains",
              value: matchedVal
            });
            message = `Filtered by ${col.title || col.field} matching "${matchedVal}".`;
            filterMatched = true;
            break;
          }
        }
      }

      // Fallback if no exact value match was found, but a column was mentioned with filter intent
      if (!filterMatched && (text.includes("filter") || text.includes("only") || text.includes("show"))) {
        const col = findColumn(text);
        if (col) {
          message = `Please specify which value you want to filter ${col.title || col.field} by.`;
        } else {
          message = "I couldn't understand which filter, sort or group operation to apply. Try using suggestions like 'Sort by employee name descending'.";
        }
      }
    }

    return NextResponse.json({
      commands,
      message
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
