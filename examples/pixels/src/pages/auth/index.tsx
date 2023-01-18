import * as React from "react";
import { useRouterContext } from "@pankod/refine-core";
import {
    AuthPage as AntdAuthPage,
    AuthProps,
    Image,
} from "@pankod/refine-antd";

import { SponsorsBanner } from "components/banners";

const authWrapperProps = {
    style: {
        backgroundImage: "url('/bg.png')",
        backgroundRepeat: "repeat-x",
    },
};

const contentProps = {
    style: {
        backgroundColor: "#fff",
        border: "1px solid #f5f5f5",
        borderRadius: "16px",
        boxShadow: "4px 8px 16px rgba(42, 42, 66, 0.25)",
        width: "384px",
        padding: "0",
    },
};

const renderAuthContent = (content: React.ReactNode) => {
    const { Link } = useRouterContext();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Link to="/" style={{ marginBottom: "32px" }}>
                <Image
                    height="160"
                    src="/pixels-logo.svg"
                    alt="pixels-logo"
                    preview={false}
                />
            </Link>
            {content}
            <SponsorsBanner />
        </div>
    );
};

export const AuthPage: React.FC<AuthProps> = ({ type, formProps, ...rest }) => {
    return (
        <AntdAuthPage
            type={type}
            wrapperProps={authWrapperProps}
            contentProps={contentProps}
            renderContent={renderAuthContent}
            formProps={formProps}
            {...rest}
        />
    );
};
