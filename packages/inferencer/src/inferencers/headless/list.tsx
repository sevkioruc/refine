import * as RefineReactTable from "@pankod/refine-react-table";

import { createInferencer } from "@/create-inferencer";
import {
    jsx,
    componentName,
    prettyString,
    accessor,
    printImports,
    dotAccessor,
    noOp,
    getVariableName,
} from "@/utilities";

import { ErrorComponent } from "./error";
import { LoadingComponent } from "./loading";
import { CodeViewerComponent } from "./code-viewer";

import { InferencerResultComponent, InferField, ImportElement } from "@/types";

const getAccessorKey = (field: InferField) => {
    return Array.isArray(field.accessor) || field.multiple
        ? `accessorKey: "${field.key}"`
        : field.accessor
        ? `accessorKey: "${dotAccessor(field.key, undefined, field.accessor)}"`
        : `accessorKey: "${field.key}"`;
};

/**
 * @experimental This is an experimental component
 */
export const ListInferencer: InferencerResultComponent = createInferencer({
    type: "list",
    additionalScope: [
        ["@pankod/refine-react-table", "RefineReactTable", RefineReactTable],
    ],
    codeViewerComponent: CodeViewerComponent,
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
    renderer: ({ resource, fields, isCustomPage }) => {
        const COMPONENT_NAME = componentName(
            resource.label ?? resource.name,
            "list",
        );
        const recordName = "tableData?.data";
        const imports: Array<ImportElement> = [
            ["React", "react", true],
            ["IResourceComponentsProps", "@pankod/refine-core"],
            ["useNavigation", "@pankod/refine-core"],
            ["useTable", "@pankod/refine-react-table"],
            ["ColumnDef", "@pankod/refine-react-table"],
            ["flexRender", "@pankod/refine-react-table"],
        ];

        const relationFields: (InferField | null)[] = fields.filter(
            (field) => field?.relation && !field?.fieldable && field?.resource,
        );

        const relationHooksCode = relationFields
            .filter(Boolean)
            .map((field) => {
                if (field?.relation && !field.fieldable && field.resource) {
                    imports.push(["GetManyResponse", "@pankod/refine-core"]);
                    imports.push(["useMany", "@pankod/refine-core"]);

                    let idsString = "";

                    if (field.multiple) {
                        idsString = `[].concat(...(${recordName}?.map((item) => ${accessor(
                            "item",
                            field.key,
                            field.accessor,
                            false,
                        )}) ?? []))`;
                    } else {
                        idsString = `${recordName}?.map((item) => ${accessor(
                            "item",
                            field.key,
                            field.accessor,
                            false,
                        )}) ?? []`;
                    }

                    return `
                    const { data: ${getVariableName(field.key, "Data")} } =
                    useMany({
                        resource: "${field.resource.name}",
                        ids: ${idsString},
                        queryOptions: {
                            enabled: !!${recordName},
                        },
                    });
                    `;
                }
                return undefined;
            })
            .filter(Boolean);

        const relationVariableNames = relationFields
            ?.map((field) => {
                if (field && field.resource) {
                    return getVariableName(field.key, "Data");
                }
                return undefined;
            })
            .filter(Boolean);

        const renderRelationFields = (field: InferField) => {
            if (field.relation && field.resource) {
                const variableName = `${getVariableName(
                    field.key,
                    "Data",
                )}?.data`;

                if (Array.isArray(field.accessor)) {
                    // not handled - not possible case
                    return undefined;
                }

                const id = `id: "${field.key}"`;
                const header = `header: "${prettyString(field.key)}"`;
                const accessorKey = getAccessorKey(field);

                let cell = "";

                // if multiple, then map it with tagfield
                // if not, then just show the value

                if (field.multiple) {
                    let val = "item";

                    // for multiple
                    if (field?.relationInfer) {
                        val = accessor(
                            "item",
                            undefined,
                            field.relationInfer.accessor,
                        );
                    }

                    cell = `cell: function render({ getValue, table }) {
                        const meta = table.options.meta as {
                            ${getVariableName(
                                field.key,
                                "Data",
                            )}: GetManyResponse;
                        };

                        ${field?.accessor ? "try {" : ""}

                        const ${getVariableName(
                            field.key,
                            "",
                        )} = getValue<any[]>()?.map((item) => {
                            return meta.${getVariableName(
                                field.key,
                                "Data",
                            )}?.data?.find(
                                (resourceItems) => resourceItems.id === ${accessor(
                                    "item",
                                    undefined,
                                    field.accessor,
                                )}
                            );
                        })


                        return (
                            <ul>
                                {${getVariableName(
                                    field.key,
                                    "",
                                )}?.map((item, index) => (
                                    <li key={index}>
                                        {${val}}
                                    </li>
                                ))}
                            </ul>
                        )
                        ${
                            field?.accessor
                                ? " } catch (error) { return null; }"
                                : ""
                        }
                    }
                `;
                } else {
                    if (field?.relationInfer) {
                        cell = `cell: function render({ getValue, table }) {
                            const meta = table.options.meta as {
                                ${getVariableName(
                                    field.key,
                                    "Data",
                                )}: GetManyResponse;
                            };

                            ${field?.accessor ? "try {" : ""}

                            const ${getVariableName(
                                field.key,
                                "",
                            )} = meta.${variableName}?.find(
                                (item) => item.id === getValue<any>(),
                            );

                            return ${accessor(
                                getVariableName(field.key),
                                undefined,
                                field?.relationInfer?.accessor,
                            )} ?? "Loading...";

                            ${
                                field?.accessor
                                    ? " } catch (error) { return null; }"
                                    : ""
                            }
                        },`;
                    } else {
                        cell = "";
                    }
                }

                return `
                    {
                        ${id},
                        ${header},
                        ${accessorKey},
                        ${cell}
                    }
                `;
            }
            return undefined;
        };

        const imageFields = (field: InferField) => {
            if (field.type === "image") {
                const id = `id: "${field.key}"`;
                const accessorKey = getAccessorKey(field);
                const header = `header: "${prettyString(field.key)}"`;

                let cell = jsx`
                    cell: function render({ getValue }) {
                        ${field?.accessor ? "try {" : ""}
                            return <img style={{ maxWidth: "100px" }} src={${accessor(
                                "getValue<any>()",
                                undefined,
                                Array.isArray(field.accessor)
                                    ? field.accessor
                                    : undefined,
                                " + ",
                            )}} />
                        ${
                            field?.accessor
                                ? " } catch (error) { return null; }"
                                : ""
                        }
                    }
                `;

                if (field.multiple) {
                    const val = accessor(
                        "item",
                        undefined,
                        field.accessor,
                        " + ",
                    );

                    cell = `
                        cell: function render({ getValue }) {
                            ${field?.accessor ? "try {" : ""}
                                return (
                                    <ul>
                                        {getValue<any[]>()?.map((item, index) => (
                                            <li key={index}><img src={${val}} style={{ height: "50px", maxWidth: "100px" }} /></li>
                                        ))}
                                    </ul>
                                )
                            ${
                                field?.accessor
                                    ? " } catch (error) { return null; }"
                                    : ""
                            }
                        }
                    `;
                }

                return `
                    {
                        ${id},
                        ${accessorKey},
                        ${header},
                        ${cell}
                    }
                `;
            }
            return undefined;
        };

        const emailFields = (field: InferField) => {
            if (field.type === "email") {
                const id = `id: "${field.key}"`;
                const accessorKey = getAccessorKey(field);
                const header = `header: "${prettyString(field.key)}"`;

                let cell = jsx`
                    cell: function render({ getValue }) {
                        return <a href={"mailto:" + ${accessor(
                            "getValue<any>()",
                            undefined,
                            Array.isArray(field.accessor)
                                ? field.accessor
                                : undefined,
                            ' + " " + ',
                        )}}>{${accessor(
                    "getValue<any>()",
                    undefined,
                    Array.isArray(field.accessor) ? field.accessor : undefined,
                    ' + " " + ',
                )}}</a>
                    }
                `;

                if (field.multiple) {
                    const val = accessor(
                        "item",
                        undefined,
                        field.accessor,
                        " + ",
                    );

                    cell = `
                        cell: function render({ getValue }) {
                            return (
                                <ul>
                                    {getValue<any[]>()?.map((item, index) => (
                                        <li key={index}>
                                            {${val}}
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                    `;
                }

                return `
                    {
                        ${id},
                        ${accessorKey},
                        ${header},
                        ${cell}
                    }
                `;
            }
            return undefined;
        };

        const urlFields = (field: InferField) => {
            if (field.type === "url") {
                const id = `id: "${field.key}"`;
                const accessorKey = getAccessorKey(field);
                const header = `header: "${prettyString(field.key)}"`;

                let cell = jsx`
                    cell: function render({ getValue }) {
                        return <a href={${accessor(
                            "getValue<any>()",
                            undefined,
                            Array.isArray(field.accessor)
                                ? field.accessor
                                : undefined,
                            " + ",
                        )}}>{${accessor(
                    "getValue<any>()",
                    undefined,
                    Array.isArray(field.accessor) ? field.accessor : undefined,
                    " + ",
                )}}</a>
                    }
                `;

                if (field.multiple) {
                    const val = accessor(
                        "item",
                        undefined,
                        field.accessor,
                        " + ",
                    );

                    cell = `
                        cell: function render({ getValue }) {
                            return (
                                <ul>
                                    {getValue<any[]>()?.map((item, index) => (
                                        <li key={index}>
                                            {${val}}
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                    `;
                }

                return `
                    {
                        ${id},
                        ${accessorKey},
                        ${header},
                        ${cell}
                    }
                `;
            }
            return undefined;
        };

        const booleanFields = (field: InferField) => {
            if (field?.type === "boolean") {
                const id = `id: "${field.key}"`;
                const accessorKey = getAccessorKey(field);
                const header = `header: "${prettyString(field.key)}"`;

                let cell = jsx`
                    cell: function render({ getValue }) {
                        return ${accessor(
                            "getValue<any>()",
                            undefined,
                            Array.isArray(field.accessor)
                                ? field.accessor
                                : undefined,
                            " + ",
                        )} ? "yes" : "no"
                    }
                `;

                if (field.multiple) {
                    const val = accessor(
                        "item",
                        undefined,
                        field.accessor,
                        " + ",
                    );

                    cell = `
                        cell: function render({ getValue }) {
                            return (
                                <ul>
                                    {getValue<any[]>()?.map((item, index) => (
                                        <li key={index}>
                                            {${val} ? "yes" : "no"}
                                        </li>
                                    ))}
                                </ul>
                            );
                        }
                    `;
                }

                return `
                    {
                        ${id},
                        ${accessorKey},
                        ${header},
                        ${cell}
                    }
                `;
            }

            return undefined;
        };

        const dateFields = (field: InferField) => {
            if (field.type === "date") {
                const id = `id: "${field.key}"`;
                const accessorKey = getAccessorKey(field);
                const header = `header: "${prettyString(field.key)}"`;

                let cell = jsx`
                    cell: function render({ getValue }) {
                        return (new Date(${accessor(
                            "getValue<any>()",
                            undefined,
                            Array.isArray(field.accessor)
                                ? field.accessor
                                : undefined,
                            ' + " " + ',
                        )})).toLocaleString(undefined, { timeZone: "UTC" })
                    }
                `;

                if (field.multiple) {
                    const val = accessor(
                        "item",
                        undefined,
                        field.accessor,
                        " + ",
                    );

                    cell = `
                        cell: function render({ getValue }) {
                            return (
                                <ul>
                                    {getValue<any[]>()?.map((item, index) => (
                                        <li key={index}>
                                        {(new Date(${val})).toLocaleString(undefined, { timeZone: "UTC" })}
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                    `;
                }

                return `
                    {
                        ${id},
                        ${accessorKey},
                        ${header},
                        ${cell}
                    }
                `;
            }
            return undefined;
        };

        const basicFields = (field: InferField) => {
            if (
                field &&
                (field.type === "text" ||
                    field.type === "number" ||
                    field.type === "richtext")
            ) {
                const id = `id: "${field.key}"`;
                const accessorKey = getAccessorKey(field);
                const header = `header: "${prettyString(field.key)}"`;

                let cell = "";

                if (field.multiple) {
                    const val = accessor(
                        "item",
                        undefined,
                        field.accessor,
                        ' + " " + ',
                    );

                    cell = `
                        cell: function render({ getValue }) {
                            return (
                                <ul>
                                    {getValue<any[]>()?.map((item, index) => (
                                        <li key={index}>
                                            {${val}}
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                    `;
                }

                if (!field.multiple && Array.isArray(field.accessor)) {
                    cell = `
                        cell: function render({ getValue }) {
                            return (
                                <>{${accessor(
                                    "getValue<any>()",
                                    field.key,
                                    field.accessor,
                                )}}</>
                            );
                        }
                    `;
                }

                return `
                    {
                        ${id},
                        ${accessorKey},
                        ${header},
                        ${cell}
                    }
                `;
            }
            return undefined;
        };

        const { canEdit, canShow, canCreate } = resource ?? {};

        const actionButtons =
            canEdit || canShow
                ? jsx`
        {
            id: "actions",
            accessorKey: "id",
            header: "Actions",
            cell: function render({ getValue }) {
                return (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: "4px",
                        }}
                    >
                    ${
                        canShow
                            ? jsx`
                        <button
                            onClick={() => {
                                show("${resource.name}", getValue() as string);
                            }}
                        >
                            Show
                        </button>
                        `
                            : ""
                    }
                        ${
                            canEdit
                                ? jsx`
                                <button
                                onClick={() => {
                                    edit("${resource.name}", getValue() as string);
                                }}
                            >
                                Edit
                            </button>
                        `
                                : ""
                        }
                    </div>
                );
            },
        },
            `
                : "";

        const renderedFields: Array<string | undefined> = fields.map(
            (field) => {
                switch (field?.type) {
                    case "text":
                    case "number":
                    case "richtext":
                        return basicFields(field);
                    case "email":
                        return emailFields(field);
                    case "image":
                        return imageFields(field);
                    case "date":
                        return dateFields(field);
                    case "boolean":
                        return booleanFields(field);
                    case "url":
                        return urlFields(field);
                    case "relation":
                        return renderRelationFields(field);
                    default:
                        return undefined;
                }
            },
        );

        noOp(imports);

        return jsx`
        ${printImports(imports)}
        
        export const ${COMPONENT_NAME}: React.FC<IResourceComponentsProps> = () => {
            const columns = React.useMemo<ColumnDef<any>[]>(() => [
                ${[...renderedFields, actionButtons].filter(Boolean).join(",")}
            ], []);

            ${
                canEdit || canShow
                    ? jsx`
            const { ${canEdit ? "edit," : ""} ${canShow ? "show," : ""} ${
                          canCreate ? "create," : ""
                      } } = useNavigation();
            `
                    : ""
            }

            const {
                getHeaderGroups,
                getRowModel,
                setOptions,
                refineCore: {
                    tableQueryResult: { data: tableData },
                },
                getState,
                setPageIndex,
                getCanPreviousPage,
                getPageCount,
                getCanNextPage,
                nextPage,
                previousPage,
                setPageSize,
                getColumn,
            } = useTable({
                columns,
                ${
                    isCustomPage
                        ? `
                refineCoreProps: {
                    resource: "${resource.name}",
                }
                `
                        : ""
                }
                
            });

            ${relationHooksCode}

            setOptions((prev) => ({
                ...prev,
                meta: {
                    ...prev.meta,
                    ${relationVariableNames.join(", ")}
                },
            }));

            return (
                <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1>${prettyString(resource.label ?? resource.name)}</h1>
                    ${
                        canCreate
                            ? jsx`<button onClick={() => create("${resource.name}")}>Create</button>`
                            : ""
                    }
                </div>
                    <div style={{ maxWidth: "100%", overflowY: "scroll" }}>
                        <table>
                            <thead>
                                {getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id}>
                                                {!header.isPlaceholder && (
                                                    flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {getRowModel().rows.map((row) => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: "12px" }}>
                        <button
                            onClick={() => setPageIndex(0)}
                            disabled={!getCanPreviousPage()}
                        >
                            {"<<"}
                        </button>
                        <button
                            onClick={() => previousPage()}
                            disabled={!getCanPreviousPage()}
                        >
                            {"<"}
                        </button>
                        <button onClick={() => nextPage()} disabled={!getCanNextPage()}>
                            {">"}
                        </button>
                        <button
                            onClick={() => setPageIndex(getPageCount() - 1)}
                            disabled={!getCanNextPage()}
                        >
                            {">>"}
                        </button>
                        <span>
                            Page
                            <strong>
                                {getState().pagination.pageIndex + 1} of{" "}
                                {getPageCount()}
                            </strong>
                        </span>
                        <span>
                            | Go to page:
                            <input
                                type="number"
                                defaultValue={getState().pagination.pageIndex + 1}
                                onChange={(e) => {
                                    const page = e.target.value
                                        ? Number(e.target.value) - 1
                                        : 0;
                                    setPageIndex(page);
                                }}
                            />
                        </span>{" "}
                        <select
                            value={getState().pagination.pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                            }}
                        >
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>   
            );
        };
        `;
    },
});
