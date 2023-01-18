---
id: add-delete-feature
title: 5. Adding Delete Feature
tutorial:
    order: 0
    prev: tutorial/adding-crud-pages/{preferredUI}/add-create-page
    next: tutorial/adding-crud-pages/{preferredUI}/adding-sort-and-filters
---

There are many ways to delete a record. In this tutorial, we will first use the `<DeleteButton/>` to delete a record and then we will learn how to enable the delete feature on the show page and edit page.

## Adding Delete Feature to List Page

Let's start by adding the delete feature to the list page. To do this, we will use the `<DeleteButton/>` component.

`<DeleteButton/>` is a **refine** component that is used to delete a record. When you click on the delete button, it will show a confirmation modal. If you confirm the deletion, it will delete the record.

[Refer to the `<DeleteButton/>` documentation for more information &#8594](/docs/api-reference/mantine/components/buttons/delete-button/)

To add a delete feature to the products table, you can follow the steps below:

1. Open the `src/pages/products/list.tsx` file on your editor.

2. Import the `<DeleteButton/>` component from `@pankod/refine-mantine`:

    ```tsx
    import { DeleteButton } from "@pankod/refine-mantine";
    ```

3. Add the `<DeleteButton/>` component to the `actions` column of the table as shown below:

    ```tsx
    {
        id: "actions",
        accessorKey: "id",
        header: "Actions",
        cell: function render({ getValue }) {
            return (
                <Group spacing="xs" noWrap>
                    <ShowButton
                        hideText
                        recordItemId={getValue() as string}
                    />
                    <EditButton
                        hideText
                        recordItemId={getValue() as string}
                    />
                    <DeleteButton
                        hideText
                        recordItemId={getValue() as string}
                    />
                </Group>
            );
        },
    },
    ```

    `recordItemId` is the id of the record you want to delete.

Now, you can try to delete a record from the list page. Just click on the delete button of the record you want to delete and confirm the deletion.

## Enabling Delete Feature on Show Page and Edit Page

When we define a resource, we can enable the delete feature on the show page and edit page by setting the `canDelete` property to `true` as shown below:

```tsx src="src/App.tsx"
import { Refine } from "@pankod/refine-core";
import routerProvider from "@pankod/refine-react-router-v6";
import dataProvider from "@pankod/refine-simple-rest";
import {
    MantineProvider,
    Global,
    NotificationsProvider,
    notificationProvider,
    LightTheme,
    Layout,
    ReadyPage,
    ErrorComponent,
} from "@pankod/refine-mantine";

import { ProductList } from "pages/products/list";
import { ProductEdit } from "pages/products/edit";
import { ProductShow } from "pages/products/show";
import { ProductCreate } from "pages/products/create";

const App = () => {
    return (
        <MantineProvider theme={LightTheme} withNormalizeCSS withGlobalStyles>
            <Global styles={{ body: { WebkitFontSmoothing: "auto" } }} />
            <NotificationsProvider position="top-right">
                <Refine
                    routerProvider={routerProvider}
                    dataProvider={dataProvider(
                        "https://api.fake-rest.refine.dev",
                    )}
                    notificationProvider={notificationProvider}
                    ReadyPage={ReadyPage}
                    catchAll={<ErrorComponent />}
                    Layout={Layout}
                    resources={[
                        {
                            name: "products",
                            list: ProductList,
                            edit: ProductEdit,
                            show: ProductShow,
                            create: ProductCreate,
                            /highlight-next-line
                            canDelete: true,
                        },
                    ]}
                />
            </NotificationsProvider>
        </MantineProvider>
    );
};
export default App;
```

After setting the `canDelete` property to `true`, you will see a delete button on the show page and edit page. Because we used the `<Show/>` and `<Edit/>` components in the show page and edit page, the delete button will be added automatically in these components.

[Refer to the `<Refine/>` documentation for more information about the `canDelete` property &#8594](/docs/api-reference/core/components/refine-config.md#candelete)

<br/>

:::tip

You can also use `useDelete` hook provided by **refine** to delete a record.

[Refer to the `useDelete` documentation for more information information &#8594](/docs/api-reference/core/hooks/data/useDelete/)

:::

<br/>

<Checklist>

<ChecklistItem id="add-delete-feature-mantine">
I added the delete feature to the list page
</ChecklistItem>
<ChecklistItem id="add-delete-feature-mantine-2">
I enabled the delete feature on the show page and edit page
</ChecklistItem>

</Checklist>