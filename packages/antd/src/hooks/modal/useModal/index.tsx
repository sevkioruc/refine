import { ModalProps } from "../../../components/antd";
import {
    useModal as useCoreModal,
    useModalReturnType as useCoreModelReturnType,
} from "@pankod/refine-core";

export type useModalReturnType = {
    modalProps: ModalProps;
} & Omit<useCoreModelReturnType, "visible">;

export type useModalProps = {
    /**
     * Default props for Ant Design {@link https://ant.design/components/modal/ `<Modal>`} component.
     */
    modalProps?: ModalProps;
};

/**
 * By using `useModal` you get props for your records from API in accordance with Ant Design {@link https://ant.design/components/modal/ `<Modal>`} component.
 *
 * @see {@link https://refine.dev/docs/ui-frameworks/antd/hooks/ui/useModal} for more details.
 */
export const useModal = ({
    modalProps = {},
}: useModalProps = {}): useModalReturnType => {
    const { show, close, visible } = useCoreModal({
        defaultVisible: modalProps.open,
    });

    return {
        modalProps: {
            ...modalProps,
            onCancel: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                modalProps.onCancel?.(e);
                close();
            },
            open: visible,
            visible,
        },
        show,
        close,
    };
};
