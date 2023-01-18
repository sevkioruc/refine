import { createInferencer } from "@/create-inferencer";
import {
    jsx,
    componentName,
    prettyString,
    accessor,
    printImports,
    noOp,
    getVariableName,
    toPlural,
    toSingular,
} from "@/utilities";

import { ErrorComponent } from "./error";
import { LoadingComponent } from "./loading";
import { CodeViewerComponent } from "./code-viewer";

import { ImportElement, InferencerResultComponent, InferField } from "@/types";

/**
 * @experimental This is an experimental component
 */
export const ShowInferencer: InferencerResultComponent = createInferencer({
    type: "show",
    additionalScope: [],
    codeViewerComponent: CodeViewerComponent,
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
    renderer: ({ resource, fields, isCustomPage, id }) => {
        const COMPONENT_NAME = componentName(
            resource.label ?? resource.name,
            "show",
        );
        const recordName = "record";
        const imports: Array<ImportElement> = [
            ["React", "react", true],
            ["useShow", "@pankod/refine-core"],
            ["useResource", "@pankod/refine-core"],
            ["useNavigation", "@pankod/refine-core"],
        ];

        const relationFields: (InferField | null)[] = fields.filter(
            (field) => field?.relation && !field?.fieldable && field?.resource,
        );

        const relationHooksCode = relationFields
            .filter(Boolean)
            .map((field) => {
                if (field?.relation && !field.fieldable && field.resource) {
                    if (field.multiple) {
                        imports.push(["useMany", "@pankod/refine-core"]);
                        let ids = accessor(recordName, field.key);

                        if (field.accessor) {
                            ids = `${accessor(
                                recordName,
                                field.key,
                            )}?.map((item: any) => ${accessor(
                                "item",
                                undefined,
                                field.accessor,
                            )})`;
                        }

                        return `
                    const { data: ${getVariableName(
                        field.key,
                        "Data",
                    )}, isLoading: ${getVariableName(
                            field.key,
                            "IsLoading",
                        )} } =
                    useMany({
                        resource: "${field.resource.name}",
                        ids: ${ids} || [],
                        queryOptions: {
                            enabled: !!${recordName},
                        },
                    });
                    `;
                    }
                    imports.push(["useOne", "@pankod/refine-core"]);
                    return `
                    const { data: ${getVariableName(
                        field.key,
                        "Data",
                    )}, isLoading: ${getVariableName(
                        field.key,
                        "IsLoading",
                    )} } =
                    useOne({
                        resource: "${field.resource.name}",
                        id: ${accessor(
                            recordName,
                            field.key,
                            field.accessor,
                            false,
                        )} || "",
                        queryOptions: {
                            enabled: !!${recordName},
                        },
                    });
                `;
                }
                return undefined;
            })
            .filter(Boolean);

        const renderRelationFields = (field: InferField) => {
            if (field.relation && field.resource) {
                const variableName = getVariableName(field.key, "Data");
                const variableIsLoading = getVariableName(
                    field.key,
                    "IsLoading",
                );

                if (field.multiple) {
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                        {${variableIsLoading} ? <>Loading...</> : (
                            <>
                            ${(() => {
                                if (field.relationInfer) {
                                    if (field.relationInfer?.accessor) {
                                        if (
                                            Array.isArray(
                                                field.relationInfer.accessor,
                                            )
                                        ) {
                                            return "";
                                        } else {
                                            const mapItemName = getVariableName(
                                                field.key,
                                            );
                                            const val = accessor(
                                                mapItemName,
                                                undefined,
                                                field.relationInfer.accessor,
                                            );
                                            return jsx`
                                                {${variableName}?.data?.map((${mapItemName}: any) => <li key={${val}}>{${val}}</li>)}
                                            `;
                                        }
                                    } else {
                                        return "";
                                    }
                                } else {
                                    return "";
                                }
                            })()}
                            </>
                        )}
                        </ul>
                    </div>
                    `;
                }
                return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <div>
                        {${variableIsLoading} ? <>Loading...</> : (
                            <>
                            ${(() => {
                                if (field.relationInfer) {
                                    if (field.relationInfer?.accessor) {
                                        if (
                                            Array.isArray(
                                                field.relationInfer.accessor,
                                            )
                                        ) {
                                            return `{${accessor(
                                                `${variableName}?.data`,
                                                undefined,
                                                field.relationInfer.accessor,
                                                ' + " " + ',
                                            )}}`;
                                        } else {
                                            return `{${variableName}?.data?.${field.relationInfer.accessor}}`;
                                        }
                                    } else {
                                        return `{${variableName}?.data}`;
                                    }
                                } else {
                                    return `{${variableName}?.data?.id}`;
                                }
                            })()}
                            </>
                        )}
                        </div>
                    </div>
                    `;
            }
            return undefined;
        };

        const textFields = (field: InferField) => {
            if (field.type === "text") {
                if (field.multiple) {
                    const val = accessor("item", undefined, field.accessor);
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                            {${accessor(
                                recordName,
                                field.key,
                            )}?.map((item: any) => (
                                <li key={${val}}>
                                    {${val}}
                                </li>
                            ))}
                        </ul>
                    </div>
                `;
                }
                return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <div>
                        {${accessor(recordName, field.key, field.accessor)}}
                        </div>
                    </div>
                `;
            }
            return undefined;
        };

        const imageFields = (field: InferField) => {
            if (field.type === "image") {
                if (field.multiple) {
                    const val = accessor("item", undefined, field.accessor);
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                        {${accessor(
                            recordName,
                            field.key,
                        )}?.map((item: any) => (
                            <li key={${val}}>
                                <img style={{ maxWidth: 200 }} src={${val}}/>
                            </li>
                        ))}
                        </ul>
                    </div>
                `;
                }
                return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <img src={{ maxWidth: 200 }} src={${accessor(
                            recordName,
                            field.key,
                            field.accessor,
                            " + ",
                        )}} />
                    </div>
                    `;
            }
            return undefined;
        };

        const emailFields = (field: InferField) => {
            if (field.type === "email") {
                if (field.multiple) {
                    const val = accessor("item", undefined, field.accessor);
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                            {${accessor(
                                recordName,
                                field.key,
                            )}?.map((item: any) => (
                                <li key={${val}}>
                                    <a href={"mailto:" + ${val}}>{${val}}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                `;
                }
                return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <div>
                            <a href={"mailto:" + ${accessor(
                                recordName,
                                field.key,
                                field.accessor,
                                " + ",
                            )}}>
                                {${accessor(
                                    recordName,
                                    field.key,
                                    field.accessor,
                                    " + ",
                                )}}
                            </a>
                        </div>
                    </div>
                `;
            }
            return undefined;
        };

        const urlFields = (field: InferField) => {
            if (field.type === "url") {
                if (field.multiple) {
                    const val = accessor("item", undefined, field.accessor);
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                            {${accessor(
                                recordName,
                                field.key,
                            )}?.map((item: any) => (
                                <li key={${val}}>
                                    <a href={${val}}>{${val}}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                `;
                }
                return jsx`
                <div style={{ marginTop: "6px" }}>
                    <h5>${prettyString(field.key)}</h5>
                    <div>
                        <a href={${accessor(
                            recordName,
                            field.key,
                            field.accessor,
                            " + ",
                        )}} target="_blank" rel="noreferrer">
                            {${accessor(
                                recordName,
                                field.key,
                                field.accessor,
                                " + ",
                            )}}
                        </a>
                    </div>
                </div>
                `;
            }
            return undefined;
        };

        const booleanFields = (field: InferField) => {
            if (field.type === "boolean") {
                if (field.multiple) {
                    const val = accessor("item", undefined, field.accessor);
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                            {${accessor(
                                recordName,
                                field.key,
                            )}?.map((item: any) => (
                                <li key={${val}}>
                                    {${val} ? "Yes" : "No"}
                                </li>
                            ))}
                        </ul>
                    </div>
                `;
                }
                return jsx`
                <div style={{ marginTop: "6px" }}>
                    <h5>${prettyString(field.key)}</h5>
                    <div>
                    {${accessor(
                        recordName,
                        field.key,
                        field.accessor,
                        " && ",
                    )} ? "Yes" : "No"}
                    </div>
                </div>
                `;
            }
            return undefined;
        };

        const dateFields = (field: InferField) => {
            if (field.type === "date") {
                if (field.multiple) {
                    const val = accessor("item", undefined, field.accessor);
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                        {${accessor(
                            recordName,
                            field.key,
                        )}?.map((item: any) => (
                            <li key={${val}}>
                                {(new Date(${val})).toLocaleString(undefined, { timeZone: "UTC" })}
                            </li>
                        ))}
                        </ul>
                    </div>
                `;
                }
                return jsx`
                <div style={{ marginTop: "6px" }}>
                    <h5>${prettyString(field.key)}</h5>
                    <div>
                        {(new Date(${accessor(
                            recordName,
                            field.key,
                            field.accessor,
                            " + ' ' + ",
                        )})).toLocaleString(undefined, { timeZone: "UTC" })}
                    </div>
                </div>
                `;
            }
            return undefined;
        };

        const richtextFields = (field: InferField) => {
            if (field.type === "richtext") {
                return jsx`
                <div style={{ marginTop: "6px" }}>
                    <h5>${prettyString(field.key)}</h5>
                    <p>
                    {${accessor(
                        recordName,
                        field.key,
                        field.accessor,
                        ' + " " + ',
                    )}}
                    </p>
                </div>
                `;
            }

            return undefined;
        };

        const numberFields = (field: InferField) => {
            if (field.type === "number") {
                if (field.multiple) {
                    const val = accessor("item", undefined, field.accessor);
                    return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <ul>
                            {${accessor(
                                recordName,
                                field.key,
                            )}?.map((item: any) => (
                            <li key={${val}}>
                                {${val}}
                            </li>
                            ))}
                        </ul>
                    </div>
                    `;
                }
                return jsx`
                    <div style={{ marginTop: "6px" }}>
                        <h5>${prettyString(field.key)}</h5>
                        <div>
                        {${accessor(
                            recordName,
                            field.key,
                            field.accessor,
                            ' + " " + ',
                        )} ?? ""}
                        </div>
                    </div>
                `;
            }
            return undefined;
        };

        const wrapper = (code?: string) => {
            if (code) {
                return jsx`
                    ${code}
                `;
            }
            return undefined;
        };

        const renderedFields: Array<string | undefined> = fields.map(
            (field) => {
                switch (field?.type) {
                    case "text":
                        return wrapper(textFields(field));
                    case "number":
                        return wrapper(numberFields(field));
                    case "richtext":
                        return wrapper(richtextFields(field));
                    case "email":
                        return wrapper(emailFields(field));
                    case "image":
                        return wrapper(imageFields(field));
                    case "date":
                        return wrapper(dateFields(field));
                    case "boolean":
                        return wrapper(booleanFields(field));
                    case "url":
                        return wrapper(urlFields(field));
                    case "relation":
                        return wrapper(renderRelationFields(field));
                    default:
                        return undefined;
                }
            },
        );

        const { canEdit, list } = resource ?? {};
        const canList = !!list;

        noOp(imports);

        return jsx`
        ${printImports(imports)}
        
        export const ${COMPONENT_NAME} = () => {
            const { edit, list } = useNavigation();
            ${isCustomPage ? "" : `const { id } = useResource();`}
            const { queryResult } = useShow(${
                isCustomPage
                    ? `{ 
                        resource: "${resource.name}", 
                        id: ${id}
                    }`
                    : ""
            });
            const { data, isLoading } = queryResult;

            const ${recordName} = data?.data;
        
            ${relationHooksCode}

            return (
                <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1>
                    ${prettyString(toSingular(resource.label ?? resource.name))}
                    </h1>
                    <div style={{ display: "flex", gap: "8px" }}>
                    ${
                        canList
                            ? jsx`<button onClick={() => list("${
                                  resource.name
                              }")}>${prettyString(
                                  toPlural(resource.label ?? resource.name) +
                                      " list",
                              )}</button>`
                            : ""
                    }
                    ${
                        canEdit
                            ? jsx`<button onClick={() => edit("${
                                  resource.name
                              }", ${
                                  isCustomPage ? `"${id}"` : "id ?? ''"
                              })}>Edit</button>`
                            : ""
                    }
                    </div>
                </div>
                    <div>
                        ${renderedFields.join("")}
                    </div>
                </div>
            );
        };
        `;
    },
});
