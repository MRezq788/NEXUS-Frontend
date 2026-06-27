import { InputErrorMsg } from '../errors';
import AIAssistWrapperInput from '../../../aIAssistantPanel/AIAssistWrapperInput';

export type ControlRegisterFn = (
  name: string,
  validations?: unknown,
) => Record<string, unknown>;

type NormalInputProps = {
  type?: string;
  placeholder: string;
  label?: string;
  required?: boolean;
  name: string;
  disabled?: boolean;
  inputClassName?: string;
  wrapperClassName?: string;
  controlRegister: ControlRegisterFn;
  controlName: string;
  validations?: unknown;
  errorMsg?: string | null;
  localizedInput?: boolean;
  localization?: {
    controlRegister: ControlRegisterFn;
    controlName: string;
    placeholder: string;
    validations?: unknown;
  };
  flexLayout?: boolean;
};

const NormalInput = ({
  type = 'text',
  placeholder,
  label,
  required,
  name,
  disabled = false,
  inputClassName,
  wrapperClassName,
  controlRegister,
  controlName,
  validations,
  localizedInput = false,
  localization,
  errorMsg,
  flexLayout = false,
}: NormalInputProps) => {
  const inputContainerClass =
    localizedInput && flexLayout ? `flex gap-4 ${label && 'mt-4'}` : `${label && 'mt-4'}`;

  return (
    <div className={wrapperClassName || ''}>
      {label && (
        <label
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          htmlFor={name}
        >
          {label}
          {required ? (
            <span className="text-[#D91C12] ms-2">*</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 font-normal">&nbsp; (optional)</span>
          )}
        </label>
      )}
      <div className={inputContainerClass}>
        <div className={`relative ${localizedInput && flexLayout ? 'flex-1' : ''}`}>
          {localizedInput && (
            <div className="absolute top-0 px-2 text-xs -translate-y-1/2 bg-white dark:bg-[#18191b] start-2 text-gray-700 dark:text-white font-medium">
              English
            </div>
          )}
          <input
            onInput={
              type === 'number'
                ? (e) => {
                    const input = e.target as HTMLInputElement;
                    const value = parseInt(input.value);
                    if (value < 1) {
                      input.value = '1';
                    }
                  }
                : undefined
            }
            id={name}
            name={name}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full rounded-xl border py-3 px-4 bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all ${
              inputClassName || ''
            } ${
              errorMsg
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-200 dark:border-[#2d2e33] focus:border-blue-500'
            }`}
            {...controlRegister(controlName, validations)}
          />
        </div>

        {localizedInput && (
          <div className={`relative ${flexLayout ? 'flex-1' : 'mt-4'}`}>
            <div className="absolute top-0 px-2 text-xs -translate-y-1/2 bg-white dark:bg-[#18191b] start-2 text-gray-700 dark:text-white font-medium">
              Arabic
            </div>
            <input
              onInput={
                type === 'number'
                  ? (e) => {
                      const input = e.target as HTMLInputElement;
                      const value = parseInt(input.value);
                      if (value < 1) {
                        input.value = '1';
                      }
                    }
                  : undefined
              }
              name={name + 'localized'}
              type={type}
              disabled={disabled}
              placeholder={localization?.placeholder}
              className={`w-full rounded-xl border py-3 px-4 bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all ${
                inputClassName || ''
              } ${
                errorMsg
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-[#2d2e33] focus:border-blue-500'
              }`}
              {...localization?.controlRegister(localization.controlName, localization.validations)}
            />
          </div>
        )}
      </div>

      {errorMsg && <InputErrorMsg>{errorMsg}</InputErrorMsg>}
    </div>
  );
};

export default NormalInput;

const WrappedInput = AIAssistWrapperInput(NormalInput);
export { WrappedInput };
