import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import FadeContent from '../reactbits/FadeContent';
import ColorRoleCard from '../ui/ColorRoleCard';
import ColorEditorModal from '../ui/ColorEditorModal';
import AccessibilityPanel from '../ui/AccessibilityPanel';
import { ROLE_LABELS } from '../../utils/materialPalette';
import './ColorRoles.css';

const LABEL_BY_KEY = Object.fromEntries(ROLE_LABELS);

export default function ColorRoles({
  scheme,
  rawScheme,
  overrides,
  hasEditedRoles,
  themeMode,
  onColorChange,
  onColorReset,
  onResetPalette
}) {
  const [editingRole, setEditingRole] = useState(null);

  const closeEditor = useCallback(() => setEditingRole(null), []);

  return (
    <section id="roles" className="section color-roles">
      <div className="container">
        <FadeContent duration={700} blur>
          <div className="color-roles__header">
            <div>
              <span className="section-eyebrow md-label-large">Step 4</span>
              <h2 className="md-headline-large section-heading">Generated Material colors</h2>
              <p className="md-body-large section-subheading">
                Every role in the {themeMode === 'expressive' ? 'Expressive' : themeMode === 'light' ? 'Light' : 'Dark'}{' '}
                scheme, ready to copy or fine-tune. Tap a swatch to copy, or the pencil to edit.
              </p>
            </div>
            {hasEditedRoles && (
              <button type="button" className="color-roles__reset-btn md-label-large" onClick={onResetPalette}>
                <RotateCcw size={16} />
                Reset palette
              </button>
            )}
          </div>
        </FadeContent>

        <div className="color-roles__workspace">
          <div className="color-roles__grid">
            {ROLE_LABELS.map(([key, label]) => (
              <ColorRoleCard
                key={key}
                roleKey={key}
                label={label}
                hex={scheme[key]}
                isOverridden={Boolean(overrides[key])}
                onEdit={setEditingRole}
              />
            ))}
          </div>

          <AccessibilityPanel scheme={scheme} overrides={overrides} onColorReset={onColorReset} />
        </div>
      </div>

      <ColorEditorModal
        open={Boolean(editingRole)}
        roleKey={editingRole}
        roleLabel={editingRole ? LABEL_BY_KEY[editingRole] : ''}
        value={editingRole ? scheme[editingRole] : '#000000'}
        generatedValue={editingRole ? rawScheme[editingRole] : '#000000'}
        isOverridden={editingRole ? Boolean(overrides[editingRole]) : false}
        onChange={(hex) => editingRole && onColorChange(editingRole, hex)}
        onReset={() => editingRole && onColorReset(editingRole)}
        onClose={closeEditor}
      />
    </section>
  );
}
