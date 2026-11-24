import Swal from 'sweetalert2';

const getToast = () => {
  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
};

export function showSuccess(title: string, text?: string) {
  if (typeof window === 'undefined') return;
  getToast().fire({ icon: 'success', title, text });
}

export function showError(title: string, text?: string) {
  if (typeof window === 'undefined') return;
  getToast().fire({ icon: 'error', title, text });
}

export function showConfirm(title: string, text?: string, confirmText = 'Ya, lanjutkan'): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  }).then((res) => res.isConfirmed);
}
