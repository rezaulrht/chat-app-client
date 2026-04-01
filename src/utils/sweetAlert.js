import Swal from "sweetalert2";

const BASE_OPTIONS = {
    background: "var(--color-obsidian)",
    color: "var(--color-ivory)",
    confirmButtonColor: "var(--color-accent)",
    cancelButtonColor: "rgba(255,255,255,0.12)",
};

export async function confirmSweetAlert({
    title,
    text,
    icon = "warning",
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
}) {
    const result = await Swal.fire({
        ...BASE_OPTIONS,
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        focusCancel: true,
    });

    return result.isConfirmed;
}

export function showSweetAlert({
    title,
    text,
    icon = "info",
    confirmButtonText = "OK",
}) {
    return Swal.fire({
        ...BASE_OPTIONS,
        title,
        text,
        icon,
        confirmButtonText,
    });
}