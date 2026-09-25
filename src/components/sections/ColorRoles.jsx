import { useState, useCallback, useMemo } from 'react';
import { RotateCcw, Copy, Check } from 'lucide-react';
import FadeContent from '../reactbits/FadeContent';
import ColorRoleCard from '../ui/ColorRoleCard';
import ColorEditorModal from '../ui/ColorEditorModal';
import AccessibilityPanel from '../ui/AccessibilityPanel';
import { ROLE_LABELS, ROLE_GROUPS } from '../../utils/materialPalette';
import { copyToClipboard } from '../../utils/exportUtils';
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
  onResetPalette,
  onNotify
}) {
  const [editingRole, setEditingRole] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [copiedAll, setCopiedAll] = useState(false);

  const closeEditor = useCallback(() => setEditingRole(null), []);

  const displayedGroups = useMemo(() => {
    if (selectedGroup === 'all') return ROLE_GROUPS;
    return ROLE_GROUPS.filter((g) => g.id === selectedGroup);
  }, [selectedGroup]);

  // Count how many roles in each group have manual edits
  const editedCountByGroup = useMemo(() => {
    const counts = {};
    ROLE_GROUPS.forEach((group) => {
      let count = 0;
      group.roles.forEach(([key]) => {
        if (overrides[key]) count += 1;
      });
      counts[group.id] = count;
    });
    return counts;
  }, [overrides]);

  const handleCopyAllHex = useCallback(async () => {
    const formatted = ROLE_LABELS.map(([key, label]) => `${label} (${key}): ${scheme[key] || ''}`).join('\n');
    try {
      await copyToClipboard(formatted);
      setCopiedAll(true);
      onNotify?.('All HEX values copied');
      setTimeout(() => setCopiedAll(false), 1600);
    } catch (err) {
      onNotify?.('Could not copy HEX values');
    }
  }, [scheme, onNotify]);

  return (
    <section id="roles" className="section color-roles">
      <div className="container">
        <FadeContent duration={700} blur>
          {/* Section Header */}
          <div className="color-roles__header">
            <div>
              <span className="section-eyebrow md-label-large">Step 3</span>
              <h2 className="md-headline-large section-heading">Generated Material colors</h2>
              <p className="md-body-large section-subheading">
                Every semantic role in the{' '}
                <strong className="color-roles__mode-highlight">
                  {themeMode === 'expressive' ? 'Expressive' : themeMode === 'light' ? 'Light' : 'Dark'}
                </strong>{' '}
                scheme, derived from your uploaded wallpaper. Click any swatch or copy button to copy HEX, or the pencil to fine-tune.
              </p>
            </div>

            <div className="color-roles__header-actions">
              <button
                type="button"
                className="color-roles__copy-all-btn md-label-large"
                onClick={handleCopyAllHex}
                title="Copy all role HEX values to clipboard"
              >
                {copiedAll ? <Check size={16} strokeWidth={2.4} /> : <Copy size={16} />}
                <span>{copiedAll ? 'Copied' : 'Copy All HEX'}</span>
              </button>

              {hasEditedRoles && (
                <button
                  type="button"
                  className="color-roles__reset-btn md-label-large"
                  onClick={onResetPalette}
                  title="Reset all manual overrides in current theme to generated colors"
                >
                  <RotateCcw size={16} />
                  <span>Reset palette</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="color-roles__filters-wrap">
            <div className="color-roles__filters" role="tablist" aria-label="Color role categories">
              <button
                type="button"
                role="tab"
                aria-selected={selectedGroup === 'all'}
                className={`color-roles__filter-chip ${selectedGroup === 'all' ? 'color-roles__filter-chip--active' : ''}`}
                onClick={() => setSelectedGroup('all')}
              >
                <span className="color-roles__filter-label">All Roles</span>
                <span className="color-roles__filter-count">28</span>
              </button>

              {ROLE_GROUPS.map((group) => {
                const isEdited = editedCountByGroup[group.id] > 0;
                return (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedGroup === group.id}
                    className={`color-roles__filter-chip ${selectedGroup === group.id ? 'color-roles__filter-chip--active' : ''}`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <span className="color-roles__filter-label">{group.name}</span>
                    <span className="color-roles__filter-count">{group.roles.length}</span>
                    {isEdited && <span className="color-roles__filter-dot" title="Contains custom edits" />}
                  </button>
                );
              })}
            </div>
          </div>
        </FadeContent>

        {/* Workspace: Semantic Role Groups */}
        <div className="color-roles__workspace">
          <div className="color-roles__groups-container">
            {displayedGroups.map((group) => (
              <div key={group.id} className="color-roles__group">
                <div className="color-roles__group-header">
                  <div className="color-roles__group-titles">
                    <h3 className="color-roles__group-title md-title-medium">{group.name}</h3>
                    <p className="color-roles__group-desc md-body-small">{group.description}</p>
                  </div>
                  <span className="color-roles__group-count md-label-small">
                    {group.roles.length} roles
                  </span>
                </div>

                <div className={`color-roles__grid color-roles__grid--count-${group.roles.length}`}>
                  {group.roles.map(([key, label]) => (
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
              </div>
            ))}
          </div>

          {/* Accessibility & Contrast Panel */}
          <AccessibilityPanel
            scheme={scheme}
            overrides={overrides}
            onColorReset={onColorReset}
          />
        </div>
      </div>

      {/* Material Color Editor Modal */}
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
