"""empty message

Revision ID: 19d470adc0d2
Revises: 
Create Date: 2023-07-27 11:39:08.827862

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '19d470adc0d2'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('cobranzas', sa.Column('codigo', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('cobranzas', 'codigo')
    # ### end Alembic commands ###
