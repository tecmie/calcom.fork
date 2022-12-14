import { SyntheticEvent, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import Button from "@calcom/ui/v2/core/Button";
import { Dialog, DialogContent } from "@calcom/ui/v2/core/Dialog";

import { ErrorCode } from "@lib/auth";

import TwoFactorAuthAPI from "./TwoFactorAuthAPI";

interface DisableTwoFactorAuthModalProps {
  open: boolean;
  onOpenChange: () => void;

  /** Called when the user closes the modal without disabling two-factor auth */
  onCancel: () => void;
  /** Called when the user disables two-factor auth */
  onDisable: () => void;
}

const DisableTwoFactorAuthModal = ({
  onDisable,
  onCancel,
  open,
  onOpenChange,
}: DisableTwoFactorAuthModalProps) => {
  const [password, setPassword] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useLocale();

  async function handleDisable(e: SyntheticEvent) {
    e.preventDefault();

    if (isDisabling) {
      return;
    }
    setIsDisabling(true);
    setErrorMessage(null);

    try {
      const response = await TwoFactorAuthAPI.disable(password);
      if (response.status === 200) {
        onDisable();
        return;
      }

      const body = await response.json();
      if (body.error === ErrorCode.IncorrectPassword) {
        setErrorMessage(t("incorrect_password"));
      } else {
        setErrorMessage(t("something_went_wrong"));
      }
    } catch (e) {
      setErrorMessage(t("something_went_wrong"));
      console.error(t("error_disabling_2fa"), e);
    } finally {
      setIsDisabling(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={t("disable_2fa")}
        description={t("disable_2fa_recommendation")}
        type="creation"
        useOwnActionButtons>
        <form onSubmit={handleDisable}>
          <div className="mb-4">
            <label htmlFor="password" className="mt-4 block text-sm font-medium text-gray-700">
              {t("password")}
            </label>
            <div className="mt-1">
              <input
                type="password"
                name="password"
                id="password"
                required
                value={password}
                onInput={(e) => setPassword(e.currentTarget.value)}
                className="block w-full rounded-sm border-gray-300 text-sm"
              />
            </div>

            {errorMessage && <p className="mt-1 text-sm text-red-700">{errorMessage}</p>}
          </div>
        </form>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            type="submit"
            className="ltr:ml-2 rtl:mr-2"
            onClick={handleDisable}
            disabled={password.length === 0 || isDisabling}>
            {t("disable")}
          </Button>
          <Button color="secondary" onClick={onCancel}>
            {t("cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisableTwoFactorAuthModal;
