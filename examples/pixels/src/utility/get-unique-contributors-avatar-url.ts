import { Pixel } from "types/pixel";

export const getUniqueContributorsAvatarURL = (pixels: Pixel[]) => {
    const contributorsAvatar = pixels.map(
        (pixel: Pixel) => pixel.users?.avatar_url,
    );
    const contributorsAvatarSet = new Set(contributorsAvatar);

    return [...contributorsAvatarSet];
};
